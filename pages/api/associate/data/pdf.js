import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { verifyAuth } from "src/utils/auth";
import { getDateLocalized } from "src/utils/localizedDateFns";
import { formatCpf, formatPhone } from "src/utils/string";
import { getEnumTitle, INTERNAL_USER_TYPE } from "src/utils/enums";
import { getLogoPath, getReport } from "src/utils/url";
import { getPdfBuffer } from "src/utils/puppeteer";
import cache from "memory-cache";
import templateHtml from "./data.html";
import templateCss from "./data.css";

initAuth();

const DB_COLLECTION = "associate-data";
const CACHE_KEY = "AFFILIATION_PRINT";
const CACHE_HOUR = 1;

const handlePrintPdf = async (req, res) => {
  return new Promise(async (resolve, reject) => {
    try {
      const cachedResponse = cache.get(CACHE_KEY);
      const db = getFirebaseAdmin().firestore();
      const dbQuery = db.collection(DB_COLLECTION).orderBy("affiliationNumber", "desc");

      let snapshots = null;
      let associates = [];
      if (cachedResponse) {
        console.log("CACHE HIT FOR: ", CACHE_KEY);
        associates = cachedResponse;
      } else {
        snapshots = await dbQuery.get();
      }

      const iterateList = associates.length ? associates : snapshots.docs;
      let html = await getReport(templateHtml, templateCss);
      html = html.replace("{{logoPath}}", getLogoPath(req));

      const tableHeader = `
      <tr class="heading">
        <td class="center affiliation-number">Filiação</td>
        <td>Nome</td>
        <td>E-mail</td>
        <td class="center" style="min-width: 130px;">CPF</td>
        <td class="center" style="min-width: 130px;">Data de Cadastro</td>
        <td class="center affiliation-number">Status</td>
        <td class="center" style="min-width: 130px;">Situação do Cadastro</td>
        <td class="center">Tipo</td>
        <td class="center">Data de Vencimento</td>
        <td class="center" style="min-width: 130px;">Telefone</td>
      </tr> `;


      let items = "";

      for (let i = 0, n = iterateList.length; i < n; i += 1) {
        const associate = cachedResponse ? iterateList[i] : iterateList[i].data();
        const lastClass = i === iterateList.length - 1 ? " last" : "";
        const affiliationDate = getDateLocalized(new Date(associate.affiliationDate), "dd/MM/yyyy");
        const statusDescription = associate.active === true ? "Ativo" : "Inativo";
        const situationDescription = associate.createdBy === "robot" ? "Incompleto" : "Finalizado";
        const typeDescription = getEnumTitle(INTERNAL_USER_TYPE, associate.internalUserType) || "";
        const nextPayment = getDateLocalized(new Date(associate.nextPayment), "dd/MM/yyyy");

        items += `
          <tr class="item${lastClass}">
            <td class="center">${associate.affiliationNumber}</td>
            <td>${associate.name}</td>
            <td>${associate.email}</td>
            <td class="center">${formatCpf(associate.cpf)}</td>
            <td class="center">${affiliationDate}</td>
            <td class="center">${statusDescription}</td>
            <td class="center">${situationDescription}</td>
            <td class="center">${typeDescription}</td>
            <td class="center">${nextPayment}</td>
            <td class="center">${formatPhone(associate.phoneNumber)}</td>
          </tr>
        `;

        associates.push(associate);
      }

      cache.put(CACHE_KEY, associates, CACHE_HOUR * 1000 * 60 * 60);

      html = html.replace("{{tableHeader}}", tableHeader);
      html = html.replace("{{items}}", items);

      const pdf = await getPdfBuffer(html, res, {
        landscape: true,
        displayHeaderFooter: true
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
