import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { verifyAuth } from "src/utils/auth";
import { getLogoPath, getReport } from "src/utils/url";
import { getPdfBuffer } from "src/utils/puppeteer";
import templateHtml from "./single.html";
import templateCss from "./single.css";
import { format } from "src/utils/localizedDateFns";
import { capitalize, formatCurrency } from "src/utils/string";

initAuth();

const DB_COLLECTION = "internal-products";

const handlePrintPdf = async (req, res) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = getFirebaseAdmin().firestore();
      const dbQuery = db.collection(DB_COLLECTION).orderBy("title", "asc");

      let snapshots = null;
      let products = [];
      snapshots = await dbQuery.get();

      const iterateList = products.length ? products : snapshots.docs;
      let html = await getReport(templateHtml, templateCss);
      html = html.replace("{{logoPath}}", getLogoPath(req));

      const verifyTypeItem = (type) => {
        if (type === 1) {
          type = "Loja Vestuário/Acessórios";
        }
        if (type === 2) {
          type = "Munição Clube";
        }
        if (type === 3) {
          type = "Bar";
        }
        if (type === 4) {
          type = "Serviços GTC";
        }
        if (type === 5) {
          type = "Curso terceiro";
        }
        if (type === 6) {
          type = "Campeonato";
        }
        if (type === 7) {
          type = "Loja Munição";
        }
        if (type === 8) {
          type = "Venda Antecipada";
        }
        if (type === 9) {
          type = "Serviços PF";
        }
        if (type === 10) {
          type = "Serviços EB";
        }
        if (type === 11) {
          type = "Anuidade";
        }
        if (type === 12) {
          type = "Renovação de anuidade";
        }
        if (type === 13) {
          type = "Introdução";
        }
        if (type === 14) {
          type = "Assessoria EB";
        }
        if (type === 15) {
          type = "Assessoria PF";
        }
        if (type === 16) {
          type = "Bancada";
        }
        if (type === 17) {
          type = "Pista (Campeonato)";
        }
        if (type === 18) {
          type = "Personal";
        }
        if (type === 19) {
          type = "Teste tiro";
        }
        if (type === 20) {
          type = "Clínica";
        }
        if (type === 21) {
          type = "Campeonato (terceiro)";
        }
        if (type === 22) {
          type = "Pacote de munição";
        }
        if (type === 25) {
          type = "Experience";
        }
        if (type === undefined) {
          type = "----";
        }
        return type;
      };

      const verifyStatus = (type) => {
        if (type === "A") {
          type = "Ativo";
        }
        if (type === "D") {
          type = "Inativo";
        }
        if (type === undefined) {
          type = "----";
        }
        return type;
      };

      let items = "";

      for (let i = 0, n = iterateList.length; i < n; i += 1) {
        const product = iterateList[i].data();

        items += `
        <tr class="item">
          <td class="center">${capitalize(product.title) ?? "N/A"}</td>
          <td class="center">${formatCurrency(product.price) ?? "N/A"}</td>
          <td class="center">${verifyTypeItem(product.type) ?? "N/A"}</td>
          <td class="center">${product.size ?? "N/A"}</td>
          <td class="center">${verifyStatus(product.status) ?? "N/A"}</td>
          <td class="center">${product.inventoryQuantity ?? "N/A"}</td>
        </tr>
      `;

        products.push(iterateList);
      }

      html = html.replace("{{items}}", items);

      const localDate = format(new Date(), "dd 'de' MMMM 'de' yyy");
      html = html.replace("{{localDate}}", `Porto Alegre - RS, ${localDate}`);

      const pdf = await getPdfBuffer(html, res, {
        landscape: true,
        displayHeaderFooter: false,
      });

      return pdf;

    } catch (e) {
      console.log(e);
      reject(e);
      return res.status(400).json({ ...e, success: false });
    }
  });
};

const handler = async (req, res) => {
  const isAuthenticated = await verifyAuth(req, res);

  if (!isAuthenticated) {
    return;
  }

  if (req.method === "GET") {
    return handlePrintPdf(req, res);
  }
};

export default handler;
