import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { verifyAuth } from "src/utils/auth";
import { getLogoPath, getReport } from "src/utils/url";
import { groupBy } from "src/utils/array";
import { getPdfBuffer } from "src/utils/puppeteer";
import templateHtml from "./single.html";
import templateCss from "./single.css";
import { getDateLocalized } from "src/utils/localizedDateFns";
import InvoiceHub from "src/hubs/InvoiceHub";

initAuth();

const invoiceHub = new InvoiceHub();

const handlePrint = (req, res, query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sellerId = query.sellerId;
      const productId = query.productId;
      const db = getFirebaseAdmin().firestore();

      const invoices = await invoiceHub.getInvoices({
        initialDate: query.initialDate,
        endDate: query.endDate,
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

      for (let i = 0, n = invoices.length; i < n; i++) {
        const invoice = invoices[i];

        const filter = {
          invoiceId: invoice.id,
        };

        if (sellerId) {
          filter.sellerId = sellerId;
        }

        if (productId) {
          filter.productId = productId;
        }
  
        const responseItems = await invoiceHub.getInvoiceItems(filter);
        responseItems.forEach((doc) => {
          const itemData = doc.data();

          invoiceItems.push({
            itemId: doc.id,
            ...itemData,
          });
        });
      }

      let itemsTemplate = "";

      let html = await getReport(templateHtml, templateCss);
      html = html.replace("{{logoPath}}", getLogoPath(req));

      const productTypes = groupBy(invoiceItems, "productType");
      const productTypesHeaders = Object.keys(productTypes);

      let products = [];
      ['2', '16', '18'].forEach(key => {
        let productsList = productTypes[key];
        if (productsList && productsList.length > 0) {
          products = [...products, ...productTypes[key]];
        }
      })
      
      if (!products || products.length === 0) {
        res.setHeader("Content-Type", "application/json");
        res.status(400).json({
          success: false,
          message: "Nenhuma munição utilizada no intervalo de datas informado.",
        });
        return reject();
      }

      let totalQuantity = 0

      for (let c = 0; c < products.length; c++) {
        let item = products[c];
        let invoice = invoices.find((i) => i.id === item.invoiceId);

        totalQuantity += item.quantity 

        let data = {
          name: invoice.associateName,
          crNumber: invoice.associateCrNumber,
        }

        if (!data.associateCrNumber) {
          console.log(`Associate(${invoice.associateId}) without CR on invoice, need to get data from firebase`);
          let associate = await db
            .collection("associate-data")
            .doc(invoice.associateId)
            .get();

          data = associate.data();
        }

        if (null != data) {
          item = Object.assign(item, {
            associateName: data.name,
            crNumber: data.crNumber,
            invoiceId: invoice.invoiceId,
            associateId: invoice.associateId,
          });
        }

        itemsTemplate += `
          <tr class="item">
            <td class="center">${c + 1}</td>
            <td class="center">${item.associateName ?? "N/A"}</td>
            <td class="center">${item.crNumber ?? "N/A"}</td>
            <td class="center">N/A</td>
            <td class="center">N/A</td>
            <td class="center">${item.productTitle ?? "N/A"}</td>
            <td class="center">N/A</td>
            <td class="center">${item.quantity ?? "N/A"}</td>
          </tr>
        `;
      }

      html = html.replace("{{items}}", itemsTemplate);

      const monthYear = getDateLocalized(query.initialDate, "MMMM/yyy");
      const localDate = getDateLocalized(new Date(), "dd 'de' MMMM 'de' yyy");

      html = html.replace("{{monthYear}}", monthYear.toUpperCase());
      html = html.replace("{{localDate}}", `Porto Alegre - RS, ${localDate}`);
      html = html.replace("{{totalQuantity}}", totalQuantity);

      const pdf = await getPdfBuffer(html, res, res, { landscape: true });
      return pdf;

    } catch (e) {
      console.log(e);
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
