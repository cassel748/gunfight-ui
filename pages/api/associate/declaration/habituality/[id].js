import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { generateId, verifyAuth } from "src/utils/auth";
import { add } from "date-fns";
import { format, getDateLocalized } from "src/utils/localizedDateFns";
import QRCode from "qrcode";
import {
  getLogoPath,
  getReport,
  getServerUrl,
  getStampPath,
} from "src/utils/url";
import { getPdfBuffer } from "src/utils/puppeteer";
import templateHtml from "./habituality.html";
import templateCss from "./habituality.css";
import { FIREARM_CALIBERS, getEnumTitle } from "src/utils/enums";

initAuth();

const DB_COLLECTION = "associate-data";
const DB_COLLECTION_DECLARATION = "associate-declaration";
const DB_COLLECTION_ASSOCIATE_EVENTS = "associate-events";

// max number of rows that fit in a page
const ROWS_PAGE_FIT = 31;

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

      // if (!associate.active) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Usuário inativo!",
      //   });
      // }

      let html = await getReport(templateHtml, templateCss);

      const affiliationDate = getDateLocalized(
        new Date(associate.affiliationDate),
        "dd/MM/yyyy"
      );
      const nextPayment = getDateLocalized(
        new Date(associate.nextPayment),
        "dd/MM/yyyy"
      );

      html = html.replace("{{logoPath}}", getLogoPath(req));
      // Invoice Data
      html = html.replace("{{habitualityName}}", associate.name);
      html = html.replace("{{habitualityDocument}}", associate.crNumber);
      html = html.replace("{{habitualityNumber}}", associate.affiliationNumber);
      html = html.replace("{{habitualityDate}}", affiliationDate);
      html = html.replace("{{nextPaymentDate}}", nextPayment);

      // console.log("associate: ");

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

      const qrCode = await QRCode.toDataURL(
        `${getServerUrl(req)}/consulta?token=${validationCode}`
      );
      html = html.replace("{{qrCode}}", qrCode);

      html = html.replace(
        "{{emissionDate}}",
        getDateLocalized(new Date(), "dd/MM/yyyy")
      );
      html = html.replace(
        "{{emissionHour}}",
        getDateLocalized(new Date(), "HH:mm:ss")
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

      // get all habituality events for current year
      let items = "";
      let itemsProducts = "";
      let dbQueryEvents = db.collection(DB_COLLECTION_ASSOCIATE_EVENTS);

      const currentYear = new Date().getFullYear();
      const responseEvents = await dbQueryEvents
        .where("type", "==", 99)
        .where("associateId", "==", associate.id)
        .where("createdDate", ">", `01-01-${currentYear}`)
        .where("createdDate", "<", `12-31-${currentYear}`)
        .get();
      const eventsSize = responseEvents.size;

      // max 2 events to keep pdf with one page
      const pageSize = Math.ceil(eventsSize / ROWS_PAGE_FIT);
      const pages = pageSize === 1 && eventsSize <= 2 ? pageSize : pageSize + 1;

      for (let i = 0, n = eventsSize; i < n; i++) {
        const event = responseEvents.docs[i].data();

        items += `
          <tr>
            <td class="center">ASSOCIAÇÃO GUNFIGHT TRAINING CENTER</td>
            <td class="center" style="text-align: center">
              ${getDateLocalized(new Date(event.createdDate),"dd/MM/yyyy")}
            </td>
            <td class="center" style="text-align: center">TREINO</td>
          </tr>
        `;

        if (event?.products?.length) {
          for (let j=0,m=event.products.length; i<m; i+=1) {
            const product = event.products[j];
            itemsProducts += `
              <tr>
                <td class="center" style="text-align: center">${product.productTitle}</td>
                <td class="center" style="text-align: center">${getEnumTitle(FIREARM_CALIBERS, product.caliber)}</td>
                <td class="center" style="text-align: center">${product.quantity}</td>
                <td class="center" style="text-align: center">${product.gunDetail}</td>
              </tr>
            `;
          }

          html = html.replace("{{itemsProducts}}", itemsProducts);
        }
      }

      let stamp = "";
      const stampHeight = 190;
      let actualStampHeight = 0;

      for (let i = 0, n = pages; i < n; i++) {
        const randomTop = Math.floor(Math.random() * (700 - 680 + 1) + 680);
        const randomRight = Math.floor(Math.random() * (28 - 14 + 1) + 14);

        const pageNumber = i + 1;
        const top =
          pages === 1 ? 535 : randomTop * pageNumber + actualStampHeight;
        const compensation = Math.ceil(top * 0.23 - 50);

        actualStampHeight += stampHeight;

        console.log(compensation);

        stamp += `
          <img src="${getStampPath(
          req
        )}" alt="Carimbo" style="position: absolute;right: ${randomRight}%;top: ${top + compensation
          }px;width: 250px; height: 190px;" />
        `;
      }

      html = html.replace("{{stamp}}", stamp);

      html = html.replace("{{items}}", items);

      const pdf = await getPdfBuffer(html, res, {
        displayHeaderFooter: true,
      });

      const newItemRef = db.collection(DB_COLLECTION_DECLARATION);

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

  if (req.method === "GET") {
    return handlePrint(req, res, req.query.id);
  }
};

export default handler;
