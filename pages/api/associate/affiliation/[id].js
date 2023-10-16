import templateCss from "./affiliation.css";
import templateHtml from "./affiliation.html";
import { getPdfBuffer } from "src/utils/puppeteer";
import { getFirebaseAdmin } from "next-firebase-auth";
import { getLogoPath, getReport } from "src/utils/url";
import initAuth, { generateId, verifyAuth } from "src/utils/auth";
import { format, getDateLocalized } from "src/utils/localizedDateFns";
import {
  getEnumTitle,
  CATEGORY_OPTIONS,
  INTERNAL_USER_TYPE,
} from "src/utils/enums";
import {
  formatCep,
  formatCpf,
  formatPhone,
  formatCurrency,
} from "src/utils/string";

initAuth();

const fields = [
  { title: "NOME:", value: "name" },
  { title: "Tipo Cliente:", value: "{{internalUserType}}" },
  { title: "CPF:", value: "cpf" },
  { title: "DATA DE NASC", value: "birthDate", formatter: "date" },
  { title: "PROFISSÃO", value: "occupation" },
  { title: "CELULAR", value: "phoneNumber", formatter: "mobile" },
  { title: "E-MAIL", value: "email" },
  { title: "NÚM. DE MATRÍCULA:", value: "affiliationNumber" },
];

const DB_COLLECTION = "associate-data";
const DB_COLLECTION_USER_DATA = "user-data";
const DB_COLLECTION_ADDRESS = "associate-address";
const DB_COLLECTION_AFFILIATION = "associate-affiliation";

const handlePrint = (res, id, req) => {
  return new Promise(async (resolve, reject) => {
    try {
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

      let dbQueryUsers = db
        .collection(DB_COLLECTION_USER_DATA)
        .where("status", "!=", "D");

      const snapshotsUsers = await dbQueryUsers.get();
      const users = [];
      snapshotsUsers.forEach((doc) => {
        users.push({
          docId: doc.id,
          ...doc.data(),
        });
      });

      let user = users.find((a) => a.docId === associate.createdBy);

      if (!associate.active) {
        return res.status(400).json({
          success: false,
          message: "Usuário inativo!",
        });
      }

      const associateAddress = address[0];

      let html = await getReport(templateHtml, templateCss);

      html = html.replace("{{logoPath}}", getLogoPath(req));

      let fieldsTemplate = "";

      for (let index in fields) {
        const field = fields[index];
        const escapeValue = field.value && field.value.indexOf("{{") > -1;

        let finalValue = null;
        if (escapeValue) {
          finalValue = field.value;
        } else {
          const dataValue = associate[field.value]
            ? associate[field.value]
            : associateAddress[field.value];
          finalValue = dataValue ? dataValue : "";
        }

        const formatter = field.formatter;
        if (formatter && finalValue && !escapeValue) {
          if (formatter === "date") {
            const formatterMask = field.formatterMask;

            if (finalValue) {
              finalValue = getDateLocalized(
                new Date(finalValue),
                formatterMask ? formatterMask : "dd/MM/yyyy"
              );
            }
          }

          if (formatter === "enum") {
            const enumType = field.enum;
            finalValue = getEnumTitle(enumType, parseInt(finalValue, 10));
          }

          if (formatter === "cpf") {
            finalValue = formatCpf(finalValue);
          }

          if (formatter === "zip") {
            finalValue = formatCep(finalValue);
          }

          if (formatter === "currency") {
            finalValue = formatCurrency(finalValue);
          }

          if (formatter === "mobile") {
            finalValue = formatPhone(finalValue);
          }
        }

        fieldsTemplate += `
          <tr>
            <td class="title">${field.title}</td>
            <td class="value">${finalValue}</td>
          </tr>
        `;
      }

      html = html.replace("{{dataTable}}", fieldsTemplate);

      let fieldsInternalTemplate = "";

      html = html.replace(
        "{{internalUserType}}",
        getEnumTitle(INTERNAL_USER_TYPE, associate.internalUserType)
      );

      const validationCode = generateId(12);
      html = html.replace("{{validationCode}}", validationCode);

      html = html.replace("{{dataInternalTable}}", fieldsInternalTemplate);

      html = html.replace("{{neighborhood}}", associateAddress.neighborhood);
      html = html.replace("{{myRg}}", associate.rgNumber);

      html = html.replace("{{myName}}", associate.name);
      html = html.replace("{{myCpf}}", associate.cpf);
      html = html.replace("{{createdBy}}", user.name);

      html = html.replace("{{actualDay}}", getDateLocalized(new Date(), "dd"));
      html = html.replace("{{actualMonth}}", format(new Date(), "MMMM"));
      html = html.replace(
        "{{actualYear}}",
        getDateLocalized(new Date(), "yyyy")
      );

      let categoriesTemplate = "";

      for (let index in associate.category) {
        const category = associate.category[index];
        const description = getEnumTitle(CATEGORY_OPTIONS, category);
        categoriesTemplate += description;

        if (index < associate.category.length - 1) {
          categoriesTemplate += ", ";
        }
      }

      html = html.replace("{{category}}", categoriesTemplate);

      const pdf = await getPdfBuffer(html, res, {
        margin: {
          top: "12px",
          bottom: "12px",
          left: "16px",
          right: "16px",
        },
      });

      const newItemRef = db.collection(DB_COLLECTION_AFFILIATION);

      await newItemRef.add({
        code: validationCode,
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
    return handlePrint(res, req.query.id, req);
  }
};

export default handler;
