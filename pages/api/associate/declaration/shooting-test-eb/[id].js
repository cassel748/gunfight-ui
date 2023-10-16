import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { generateId, verifyAuth } from "src/utils/auth";
import { add } from "date-fns";
import {
  getEnumTitle,
  NATIONALITY,
  NATIONALITY_UNGENDERED,
} from "src/utils/enums";
import { getDateLocalized } from "src/utils/localizedDateFns";
import { formatCpf, formatCep } from "src/utils/string";
import { getReport } from "src/utils/url";
import { getPdfBuffer } from "src/utils/puppeteer";
import templateHtml from "./shooting-test-eb.html";
import templateCss from "./shooting-test-eb.css";

initAuth();

const DB_COLLECTION = "associate-data";
const DB_COLLECTION_ADDRESS = "associate-address";
const DB_COLLECTION_DECLARATION = "associate-declaration";

const handlePrint = (req, res, id, body) => {
  return new Promise(async (resolve, reject) => {
    try {
      const weaponsList = body.weaponsData;
      const db = getFirebaseAdmin().firestore();
      let dbQueryAddress = db
        .collection(DB_COLLECTION_ADDRESS)
        .orderBy("status")
        .where("status", "!=", "D")
        .where("type", "==", 1)
        .where("associateId", "==", id);

      const snapshots = await dbQueryAddress.get();
      const address = [];
      snapshots.forEach((doc) => {
        address.push({
          docId: doc.id,
          ...doc.data(),
        });
      });

      if (!address || (address && address.length === 0)) {
        res.setHeader("Content-Type", "application/json");
        res.status(400).json({
          success: false,
          message:
            "Verifique se o associado possui pelo menos 1 endereço cadastrado.",
        });
        return;
      }

      const dbQuery = db.collection(DB_COLLECTION).doc(id);

      const response = await dbQuery.get();

      const associate = {
        id: response.id,
        ...response.data(),
      };

      const associateAddress = address[0];
      const affiliationDate = getDateLocalized(
        new Date(associate.affiliationDate),
        "dd/MM/yyyy"
      );

      const table = `
      <div class="table">
      <div class="table-title">
        <span>ARMA(S) UTILIZADA(S)</span>
      </div>
      <ul class="table-data" style="border-left:solid 1px black ;">
        <li>TIPO</li>
        ${weaponsList[0] ? `<li>${weaponsList[0]?.type}</li>` : ""}
        ${weaponsList[1] ? `<li>${weaponsList[1]?.type}</li>` : ""}
      </ul>
      <ul class="table-data">
        <li>MODELO</li>
        ${weaponsList[0] ? `<li>${weaponsList[0]?.model}</li>` : ""}
        ${weaponsList[1] ? `<li>${weaponsList[1]?.model}</li>` : ""}
      </ul>
      <ul class="table-data">
        <li>MARCA</li>
        ${weaponsList[0] ? `<li>${weaponsList[0]?.brand}</li>` : ""}
        ${weaponsList[1] ? `<li>${weaponsList[1]?.brand}</li>` : ""}
      </ul>
      <ul class="table-data">
        <li>CALIBRE</li>
        ${weaponsList[0] ? `<li>${weaponsList[0]?.caliber}</li>` : ""}
        ${weaponsList[1] ? `<li>${weaponsList[1]?.caliber}</li>` : ""}
      </ul>
      <div class="table-label"> Por ser verdade e estar em consonância com a Instrução Normativa 111/2017-DG/DPF, de 31
        de janeiro de 2017, subscrevo esta.</div>
    </div>
      `;

      let html = await getReport(templateHtml, templateCss);
      const uf = associate.uf;
      // Invoice Data
      html = html.replace("{{affiliationName}}", associate.name);
      html = html.replace("{{affiliationDocument}}", associate.rgNumber);
      html = html.replace("{{affiliationCPF}}", formatCpf(associate.cpf));
      html = html.replace(
        "{{affiliationNationality}}",
        getEnumTitle(NATIONALITY_UNGENDERED, associate.nationality)
      );
      html = html.replace(
        "{{affiliationIssuingAgency}}",
        associate.issuingAgency
      );
      html = html.replace("{{affiliationUF}}", uf);
      html = html.replace(
        "{{affiliationAddress}}",
        `${associateAddress.address}, ${associateAddress.number}${
          associateAddress.complement ? ` - ${associateAddress.complement}` : ""
        }`
      );
      html = html.replace(
        "{{cityState}}",
        `${associateAddress.city} / ${associateAddress.state}`
      );
      html = html.replace("{{neighborhood}}", associateAddress.neighborhood);
      html = html.replace(
        "{{affiliationCEP}}",
        formatCep(associateAddress.zipCode)
      );
      html = html.replace(
        "{{affiliationCR}}",
        !!associate.crNumber ? associate.crNumber : "N/A"
      );

      const currentDate = getDateLocalized(
        new Date(),
        "dd 'de' MMMM 'de' yyyy"
      );
      html = html.replace(
        "{{localAndDate}}",
        `Porto Alegre - RS, __________/__________/__________ `
      );

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

      html = html.replace("{{table}}", table);

      const pdf = await getPdfBuffer(html, res, {
        displayHeaderFooter: true,
      });
      const newItemRef = db.collection(DB_COLLECTION_DECLARATION);

      const validationCode = generateId(12);

      await newItemRef.add({
        code: validationCode,
        name: associate.name,
        document: associate.cpf,
        number: associate.affiliationNumber,
        associateRegular: isAssociateRegular,
        expiration: getDateLocalized(
          add(new Date(), { days: 90 }),
          "MM-dd-yyyy"
        ),
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

  const body = JSON.parse(req.body);

  if (req.method === "POST") {
    return handlePrint(req, res, req.query.id, body);
  }
};

export default handler;
