import palette from "src/theme/palette";
import templateCss from "./grouped.css";
import templateHtml from "./grouped.html";
import { groupBy } from "src/utils/array";
import { capitalize, formatCurrency, formatPhone } from "src/utils/string";
import { getPdfBuffer } from "src/utils/puppeteer";
import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { verifyAuth } from "src/utils/auth";
import { getLogoPath, getReport } from "src/utils/url";
import { getDateLocalized } from "src/utils/localizedDateFns";
import { getEnumTitle, getOriginColor, TYPE_PRODUCT } from "src/utils/enums";

initAuth();

const DB_COLLECTION = "invoices";
const DB_COLLECTION_ITEMS = "invoice-items";
const DB_COLLECTION_ASSOCIATE = "associate-data";

const handlePrint = (req, res, query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const productId = query.productId;
      const type = query.type ? parseInt(query.type) : undefined;
      const db = getFirebaseAdmin().firestore();

      let dbQuery = db
        .collection(DB_COLLECTION)
        .where("createdDate", ">=", query.initialDate)
        .where("createdDate", "<=", query.endDate);

      const snapshots = await dbQuery.get();

      const invoices = [];
      snapshots.forEach((doc) => {
        invoices.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      if (invoices && invoices.length === 0) {
        res.setHeader("Content-Type", "application/json");
        res.status(400).json({
          success: false,
          message:
            "Nenhuma comanda encontrada para o intervalo de datas informado.",
        });
        return reject();
      }

      const associates = [];

      // REMOVE DUPLICATAS E SEPARA EM CHUNKS DE 10 ITEMS DEVIDO À LIMITAÇÃO DO FIRESTORE
      let associateIds = [
        ...new Set(invoices.map((invoice) => invoice.associateId)),
      ];
      associateIds = [...Array(Math.ceil(associateIds.length / 10))].map((_) =>
        associateIds.splice(0, 10)
      );

      for (let associatesChunk of associateIds) {
        const associateDbQuery = db
          .collection(DB_COLLECTION_ASSOCIATE)
          .where("__name__", "in", associatesChunk);

        const associateSnapshots = await associateDbQuery.get();

        associateSnapshots.forEach((doc) => {
          associates.push({
            id: doc.id,
            ...doc.data(),
          });
        });
      }

      const invoiceItems = [];
      let mainTotal = 0;

      for (let i = 0, n = invoices.length; i < n; i++) {
        const invoice = invoices[i];
        const associate = associates.find((a) => a.id === invoice.associateId);

        let dbQueryItems = db
          .collection(DB_COLLECTION_ITEMS)
          .where("invoiceId", "==", invoice.id)
          .where("status", "!=", "D");

        if (type) {
          dbQueryItems = dbQueryItems.where("productType", "==", type);
        }
        if (productId) {
          dbQueryItems = dbQueryItems.where("productId", "==", productId);
        }

        const responseItems = await dbQueryItems.get();

        responseItems.forEach((doc) => {
          const itemData = doc.data();

          invoiceItems.push({
            itemId: doc.id,
            associateEmail: associate.email ?? "N/A",
            associatePhoneNumber: associate.phoneNumber ?? "N/A",
            ...itemData,
          });
        });
      }

      if (!invoiceItems || !invoiceItems?.length) {
        res.setHeader("Content-Type", "application/json");
        res.status(400).json({
          success: false,
          message:
            "Nenhum item encontrado para o intervalo de datas informado.",
        });
        return reject();
      }

      let html = await getReport(templateHtml, templateCss);
      html = html.replace("{{logoPath}}", getLogoPath(req));

      const productTypes = groupBy(invoiceItems, "productType");
      const productTypesHeaders = Object.keys(productTypes);

      let itemsTemplate = "";

      for (let productTypeOf of productTypesHeaders) {
        let productType = productTypeOf;

        // PRODUCT TYPE IS GETTING EVENT NAME AND NOT VALUE SOMETIMES
        // NEED TO INVESTIGATE onSelect OF ProductAutocomplete
        // AS A WORKAROUND PRODUCTS WITH click TYPE ARE PARSE TO 2(AMMO)
        if (productType === "click") {
          productType = 2;
        }

        const productTypeParsed = parseInt(productType, 10);
        const productTypeDescription = getEnumTitle(
          TYPE_PRODUCT,
          productTypeParsed
        );
        const originColorScheme = getOriginColor(productTypeParsed);
        const originColor = palette.light[originColorScheme];

        let productItemsFull = productTypes[productType];

        // GROUP PRODUCTS WITH THE SAME ID, SAME  SELLER_ID AND SUM HIS QUANTITY
        let productItems = productItemsFull;

        //SORT TO STRING USE LOCALCOMPARE
        productItems.sort(function (a, b) {
          return ("" + a.productTitle).localeCompare(b.productTitle);
        });

        for (let product of productItems) {
          let invoice = invoices.find((i) => i.id === product.invoiceId);
          if (null != invoice) {
            product = Object.assign(product, {
              associateName: invoice.associateName,
              invoiceId: invoice.invoiceId,
              associateId: invoice.associateId,
            });
          }
        }

        itemsTemplate += `
          <h4 class="section-title" style="background-color: ${originColor?.main};color: ${originColor?.contrastText}">
            ${productTypeDescription}
          </h4>
        `;

        itemsTemplate +=
          '<table cellpadding="5" cellspacing="5" style="margin-bottom: 24px;margin-top: 5">';

        itemsTemplate += `
          <tr class="heading">
            <td style="width: 180px" style="text-align: start; vertical-align: top;">Item</td>
            <td class="center">Data/Hora</td>
            <td class="center">Associado</td>
            <td class="center">Email</td>
            <td class="center">Número</td>
            <td class="center">Comanda</td>
          </tr>
        `;

        for (let i = 0, n = productItems.length; i < n; i++) {
          const item = productItems[i];

          const isLast = i === productItems.length - 1;
          const lastClass = isLast ? " last" : "";

          itemsTemplate += `
            <tr class="item${lastClass}">
            <td style="text-align: start;">${item.productTitle} ${item.fromInventory
              ? "<span style='color: white;border-radius: 8px;background-color: orange;padding: 2px 6px;'>Inventário</span>"
              : ""
            }</td>
              <td class="center">${getDateLocalized(
              new Date(item.createdAt),
              "dd/MM - HH:mm"
            )}</td>
              <td class="center" >${capitalize(item.associateName)}</td>
              <td class="center">${item.associateEmail}</td>
              <td class="center">${item.associatePhoneNumber
              ? formatPhone(item.associatePhoneNumber)
              : "N/A"
            }</td>
              <td class="center">${item.invoiceId}</td>
            </tr>
          `;
        }
      }

      html = html.replace("{{itemsTemplate}}", itemsTemplate);

      const emissionDate = getDateLocalized(new Date(), "dd/MM/yyyy HH:mm");
      html = html.replace("{{reportDate}}", "Emitido em " + emissionDate);
      html = html.replace("{{total}}", formatCurrency(mainTotal));

      const pdf = await getPdfBuffer(html, res, { landscape: true });
      return pdf;

    } catch (e) {
      console.log(e);
      res.setHeader("Content-Type", "application/json");
      res.status(500).json({
        success: false,
        message: "Erro desconhecido!",
      });
      return reject({ ...e, success: false });
    }
  });
};

const handler = async (req, res) => {
  const isAuthenticated = await verifyAuth(req, res);

  if (!isAuthenticated) {
    return;
  }

  if (req.method === "GET") {
    return handlePrint(req, res, req.query);
  }
};

export default handler;
