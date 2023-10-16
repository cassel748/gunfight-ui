import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { verifyAuth } from "src/utils/auth";
import { format, getDateLocalized } from "src/utils/localizedDateFns";
import { getnewPath, getReport } from "src/utils/url";
import { getPdfBuffer } from "src/utils/puppeteer";
import templateHtml from "./hello.html";
import templateCss from "./hello.css";

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
          message: "Usuário inativo!",
        });
      }

      let html = await getReport(templateHtml, templateCss);

      html = html.replace("{{logoPath}}", getnewPath(req));

      html = html.replace("{{affiliationName}}", associate.name);
      html = html.replace("{{affiliationDate}}");

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

      const affiliationDate = getDateLocalized(
        new Date(associate.affiliationDate),
        "dd/MM/yyyy"
      );

      const pdf = await getPdfBuffer(html, res, {
        displayHeaderFooter: false,
      });
      const newItemRef = db.collection(DB_COLLECTION_DECLARATION);

      await newItemRef.add({
        name: associate.name,
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
