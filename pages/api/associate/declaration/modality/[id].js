import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { generateId, verifyAuth } from "src/utils/auth";
import { add } from "date-fns";
import { format, getDateLocalized } from "src/utils/localizedDateFns";
import { formatCpf } from "src/utils/string";
import QRCode from "qrcode";
import { getLogoPath, getReport, getServerUrl, getStampPath } from "src/utils/url";
import { getPdfBuffer } from "src/utils/puppeteer";
import templateHtml from "./modality.html";
import templateCss from "./modality.css";

initAuth();

const DB_COLLECTION = "associate-data";
const DB_COLLECTION_DECLARATION = "associate-declaration";

const handlePrint = (req, res, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = getFirebaseAdmin().firestore();
      const dbQuery = db.collection(DB_COLLECTION).doc(id);

      const response = await dbQuery.get();

      const associate = {
        id: response.id,
        ...response.data(),
      };

      if (!associate.active) {
        return res.status(400).json({
          success: false,
          message: "Usuário inativo!"
        });
      }

      let html = await getReport(templateHtml, templateCss);

      const affiliationDate = getDateLocalized(
        new Date(associate.affiliationDate),
        "dd/MM/yyyy"
      );

      html = html.replace("{{logoPath}}", getLogoPath(req));
      // Invoice Data
      html = html.replace("{{modalityName}}", associate.name);
      html = html.replace("{{modalityCPF}}", formatCpf(associate.cpf));
      html = html.replace("{{modalityRG}}", associate.rgNumber);
      html = html.replace("{{modalityIssuingAgency}}", associate.issuingAgency);
      html = html.replace("{{modalityUF}}", associate.uf);
      html = html.replace("{{modalityCR}}", associate.crNumber);
      html = html.replace("{{modalityDocument}}", associate.affiliationNumber);
      html = html.replace("{{modalityDate}}", affiliationDate);

      html = html.replace(
        "{{actualDate}}",
        `${getDateLocalized(
          new Date(),
          "dd"
        )} de <span style="text-transform: uppercase">${format(
          new Date(),
          "MMMM"
        )}</span> de ${getDateLocalized(new Date(), "yyyy")}`
      );

      const validationCode = generateId(12);
      html = html.replace("{{validationCode}}", validationCode);
      html = html.replace("{{validationId}}", validationCode);
      html = html.replaceAll("{{stampPath}}", getStampPath(req));

      const qrCode = await QRCode.toDataURL(
        `${getServerUrl(req)}/consulta?token=${validationCode}`
      );
      html = html.replace("{{qrCode}}", qrCode);

      html = html.replace("{{emissionDate}}", getDateLocalized(new Date(), "dd/MM/yyyy"));
      html = html.replace("{{emissionHour}}", getDateLocalized(new Date(), "HH:mm:ss"));


      const isAssociateRegular =
        !associate.nextPayment || associate.nextPayment === ""
          ? true
          : new Date(associate.nextPayment).getTime() >= new Date().getTime();

      if (isAssociateRegular) {
        html = html.replace(
          "{{declarationText}}",
          `
          está regularmente inscrito nesta Entidade sob o nº <strong>${associate.affiliationNumber}</strong>,
          datado de <strong>${affiliationDate}</strong> e esta em dia com suas obrigações estatutárias
          referente ao presente exercício fiscal
        `
        );
      } else {
        html = html.replace(
          "{{declarationText}}",
          `
          possui pendências nesta Entidade sob o nº <strong>${associate.affiliationNumber}</strong>,
          datado de <strong>${affiliationDate}</strong> e <strong><u>NÃO</u></strong> esta em dia com suas obrigações estatutárias
          referente ao presente exercício fiscal
        `
        );
      }

      const pdf = await getPdfBuffer(html, res, {});
      const newItemRef = db.collection(DB_COLLECTION_DECLARATION);

      await newItemRef.add({
        code: validationCode,
        name: associate.name,
        document: associate.cpf,
        number: associate.affiliationNumber,
        associateRegular: isAssociateRegular,
        expiration: getDateLocalized(add(new Date(), { days: 90 }), "MM-dd-yyyy"),
        createdAt: getDateLocalized(new Date(), "MM-dd-yyyy hh:mm:ss"),
        createdDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
        createdDateTimestamp: new Date(),
      });

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
    return handlePrint(req, res, req.query.id);
  }
};

export default handler;
