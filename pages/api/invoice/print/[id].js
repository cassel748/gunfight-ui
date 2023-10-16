import QRCode from "qrcode";
import templateCss from "./invoice.css";
import templateHtml from "./invoice.html";
import { formatCurrency } from "src/utils/string";
import { getPdfBuffer } from "src/utils/puppeteer";
import initAuth, { verifyAuth } from "src/utils/auth";
import { getFirebaseAdmin } from "next-firebase-auth";
import { getDateLocalized } from "src/utils/localizedDateFns";
import { getLogoPath, getReport, getServerUrl } from "src/utils/url";
import {
  getEnumTitle,
  INTERNAL_USER_TYPE,
  PAYMENT_METHODS,
} from "src/utils/enums";

initAuth();

const DB_COLLECTION = "invoices";
const DB_COLLECTION_ITEMS = "invoice-items";
const DB_COLLECTION_USER_DATA = "user-data";

const handlePrint = (req, res, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = getFirebaseAdmin().firestore();
      const dbQuery = db.collection(DB_COLLECTION).doc(id);

      const response = await dbQuery.get();

      const invoice = {
        id: response.id,
        ...response.data(),
      };

      const dbQuery_user_data = db
        .collection(DB_COLLECTION_USER_DATA)
        .doc(invoice.finishedBy);

      const responseName = await dbQuery_user_data.get();

      const finishedName = {
        name: responseName.name,
        ...responseName.data(),
      };

      const dbQueryItems = db
        .collection(DB_COLLECTION_ITEMS)
        .where("invoiceId", "==", id)
        .where("status", "!=", "D");
      const responseItems = await dbQueryItems.get();
      const invoiceItems = [];
      responseItems.forEach((doc) => {
        invoiceItems.push({
          docId: doc.id,
          ...doc.data(),
        });
      });

      let html = await getReport(templateHtml, templateCss);

      html = html.replace("{{logoPath}}", getLogoPath(req));

      // Invoice Data
      html = html.replace("{{invoiceId}}", "Comanda #" + invoice.invoiceId);

      const newFinishedAt = new Date(invoice.finishedAt);
      const newCreatedAt = new Date(invoice.finishedAt);

      /*if (process.env.NODE_ENV !== "development") {
        newFinishedAt.setHours(newFinishedAt.getHours() + 3);
        newCreatedAt.setHours(newCreatedAt.getHours() + 3);
      }*/

      if (invoice.finishedAt) {
        html = html.replace(
          "{{invoiceDate}}",
          "Finalizada dia " +
            getDateLocalized(new Date(invoice.finishedAt), "dd/MM/yyyy") +
            " as " +
            getDateLocalized(new Date(newFinishedAt), "HH:mm")
        );
      } else {
        html = html.replace("{{invoiceDate}}", "Não finalizada");
      }

      html = html.replace("{{nameFinalize}}", "Por " + finishedName.name);
      html = html.replace("{{associateNumber}}", invoice.associateNumber);
      html = html.replace("{{associateName}}", invoice.associateName);
      html = html.replace(
        "{{initializedDate}}",
        "Dia " + getDateLocalized(new Date(invoice.createdAt), "dd/MM/yyyy")
      );
      html = html.replace(
        "{{initializedHours}}",
        " as " + getDateLocalized(new Date(invoice.createdAt), "HH:mm")
      );

      html = html.replace(
        "{{paymentMethod}}",
        getEnumTitle(PAYMENT_METHODS, invoice.paymentForm) || " Não disponível "
      );
      html = html.replace("{{invoiceDbId}}", invoice.id);
      html = html.replace("{{sellerName}}", invoice.sellerName);
      html = html.replace(
        "{{paymentDiscount}}",
        formatCurrency(invoice.paymentDiscount)
      );

      const itemsDiscount = invoiceItems
        .filter((item) => item.itemDiscount !== undefined)
        .map((item) => item.itemDiscount)
        .reduce((prev, curr) => prev + curr, 0);

      html = html.replace(
        "{{internalUserType}}",
        getEnumTitle(INTERNAL_USER_TYPE, invoice.internalUserType)
      );
      html = html.replace("{{discount}}", formatCurrency(itemsDiscount));
      html = html.replace(
        "{{subtotal}}",
        formatCurrency(invoice.subtotal + itemsDiscount)
      );
      html = html.replace("{{total}}", formatCurrency(invoice.total));

      if (invoice.observation) {
        html = html.replace(
          "{{observation}}",
          `<div class="invoice-observation">Observações: <br />${invoice.observation}</div>`
        );
      } else {
        html = html.replace("{{observation}}", "");
      }

      let items = "";

      const calc = (quantity, productPrice, itemDiscount) => {
        if (itemDiscount) {
          return quantity * productPrice - itemDiscount;
        }
        return quantity * productPrice;
      };

      for (let i = 0, n = invoiceItems.length; i < n; i++) {
        const item = invoiceItems[i];
        const lastClass = i === invoiceItems.length - 1 ? " last" : "";

        items += `
          <tr class="item${lastClass}">
          <td>${item.productTitle} ${
          item.fromInventory
            ? "<span style='color: white;border-radius: 8px;background-color: orange;padding: 2px 6px;'>Inventário</span>"
            : ""
        }
        ${
          item?.docId === "YEEWPUJxPDw00Po9vTQy"
            ? `<span style='color: white;border-radius: 8px;background-color: red;padding: 2px 6px;'>${item.gunDetail}</span>`
            : ""
        }
        </td>
          <td class="center"> ${getDateLocalized(
            new Date(newCreatedAt),
            "dd/MM • HH:mm"
          )}</td>
          <td class="center">${item.sellerName}</td>
            <td class="center">${item.quantity}</td>
            <td class="center">${formatCurrency(item.productPrice)}</td>
            <td class="center">${
              item.itemDiscount ? formatCurrency(item.itemDiscount) : "Não"
            }</td>
            <td class="right">${formatCurrency(
              calc(item.quantity, item.productPrice, item.itemDiscount)
            )}</td>
          </tr>
        `;
      }

      if (invoiceItems && invoiceItems.length === 0) {
        items += `
        <tr class="item last">
          <td></td>
          <td class="right"><span style="display: block;padding-top: 14px">Nenhum item</span></td>
          <td><span style="display: block;margin-left: -12px;padding-top: 14px">na comanda</span></td>
        </tr>
        `;
      }

      html = html.replace("{{items}}", items);

      const qrCode = await QRCode.toDataURL(
        `${getServerUrl(req)}/actions/invoices/${invoice.id}`
      );
      html = html.replace("{{qrCode}}", qrCode);

      const pdf = await getPdfBuffer(html, res, {});
      return pdf;
    } catch (e) {
      console.log(e);
      reject({ ...e, success: false });
      res.send({
        error: e,
      });
      return;
    }
  });
};

const handler = async (req, res) => {
  const isAuthenticated = await verifyAuth(req, res);

  if (!isAuthenticated) {
    return;
  }

  if (req.method === "GET") {
    return handlePrint(req, res, req.query.id);
  }
};

export default handler;
