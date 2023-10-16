import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { verifyAuth } from "src/utils/auth";
import { getEnumTitle, getOriginColor, TYPE_PRODUCT } from "src/utils/enums";
import { formatCurrency } from "src/utils/string";
import { getLogoPath, getReport } from "src/utils/url";
import { groupBy } from "src/utils/array";
import palette from "src/theme/palette";
import { getDateLocalized } from "src/utils/localizedDateFns";
import { getPdfBuffer } from "src/utils/puppeteer";
import templateHtml from "./grouped.html";
import templateCss from "./grouped.css";

initAuth();

const DB_COLLECTION = "invoices";
const DB_COLLECTION_ITEMS = "invoice-items";

const handlePrint = (req, res, query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sellerId = query.sellerId;
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

      const invoiceItems = [];
      let mainTotal = 0;
      let mainDiscount = 0;
      let mainSubtotal = 0;
      let userName = "";

      for (let i = 0, n = invoices.length; i < n; i++) {
        const invoice = invoices[i];

        let dbQueryItems = db
          .collection(DB_COLLECTION_ITEMS)
          .where("invoiceId", "==", invoice.id)
          .where("status", "!=", "D");

        if (sellerId) {
          dbQueryItems = dbQueryItems.where("sellerId", "==", sellerId);
        }

        if (type) {
          dbQueryItems = dbQueryItems.where("productType", "==", type);
        }
        if (productId) {
          dbQueryItems = dbQueryItems.where("productId", "==", productId);
        }

        const responseItems = await dbQueryItems.get();

        responseItems.forEach((doc) => {
          const itemData = doc.data();

          let itemFinalTotal = itemData.fromInventory
            ? 0
            : itemData.quantity * itemData.productPrice;

          let itemFinalDiscount = itemFinalTotal;

          let itemFinalSubtotal = itemFinalTotal;

          if (itemFinalTotal && itemData.itemDiscount) {
            itemFinalTotal = itemFinalTotal - itemData.itemDiscount;
          }

          if (itemFinalTotal && itemData.applyDiscount) {
            itemFinalTotal =
              itemFinalTotal - itemData.failCount * itemData.productPrice;
          }

          mainSubtotal += itemFinalSubtotal;
          mainTotal += itemFinalTotal;
          mainDiscount += itemFinalDiscount - itemFinalTotal;

          invoiceItems.push({
            itemId: doc.id,
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
              paymentForm: invoice.paymentForm,
              invoiceId: invoice.invoiceId,
              associateId: invoice.associateId,
            });
          }
        }

        const verifyPaymentForm = (pay) => {
          if (pay === 1) {
            pay = "Débito";
          }
          if (pay === 2) {
            pay = "Crédito";
          }
          if (pay === 3) {
            pay = "Dinheiro";
          }
          if (pay === 4) {
            pay = "Pix";
          }
          if (pay === 5) {
            pay = "Invent/Saldo";
          }
          if (pay === 6) {
            pay = "Mista";
          }
          if (pay === undefined) {
            pay = "----";
          }
          return pay;
        };

        // itemsTemplate += `
        //   <h4 class="section-title" style="background-color: ${originColor?.main};color: ${originColor?.contrastText}">
        //     ${productTypeDescription}
        //   </h4>
        // `;

        itemsTemplate +=
          '<table cellpadding="5" cellspacing="5" style="margin-bottom: 24px;margin-top: 5">';

        let itensTotalCount = 0;
        let itensTotalDiscount = 0;
        let itensTotalValue = 0;

        for (let i = 0, n = productItems.length; i < n; i++) {
          const item = productItems[i];
          const itemSubtotal = item.fromInventory
            ? 0
            : item.quantity * item.productPrice;
          let itemFinalTotal = itemSubtotal;

          const nameUser = item.associateName;

          let itemFinalDiscount = itemSubtotal;

          if (itemFinalTotal && item.itemDiscount) {
            itemFinalTotal = itemFinalTotal - item.itemDiscount;
          }

          if (itemFinalTotal && item.applyDiscount) {
            itemFinalTotal =
              itemFinalTotal - item.failCount * item.productPrice;
          }

          const isLast = i === productItems.length - 1;

          itensTotalCount += item.quantity;
          itensTotalDiscount += itemFinalDiscount;
          itensTotalValue += itemFinalTotal;

          if (isLast) {
            itemsTemplate += `
              </table>
              <div class="invoice-values-box">
              <h4 class="section-title" style="background-color: ${
                originColor?.main
              };color: ${originColor?.contrastText}">
              ${productTypeDescription}
            </h4>
                <div class="invoice-quantity">Total de itens: ${itensTotalCount}</div>
                <div class="invoice-values clearfix">

                <div class="divider"></div>
                <div class="invoice-subtotal">Subtotal: ${formatCurrency(
                  itensTotalDiscount
                )}</div>
                <div class="invoice-discount">Descontos:
                ${formatCurrency(itensTotalDiscount - itensTotalValue)}
                  
                  </div>
                <div class="invoice-total">Total: ${formatCurrency(
                  itensTotalValue
                )}</div>
              </div>
              </div>

            `;
          }
        }
      }

      html = html.replace("{{itemsTemplate}}", itemsTemplate);

      const emissionDate = getDateLocalized(new Date(), "dd/MM/yyyy HH:mm");
      html = html.replace("{{reportDate}}", "Emitido em " + emissionDate);
      html = html.replace("{{subtotal}}", formatCurrency(mainSubtotal));
      html = html.replace("{{discount}}", formatCurrency(mainDiscount));
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
