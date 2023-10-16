import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { verifyAuth } from "src/utils/auth";
import { getDateLocalized } from "src/utils/localizedDateFns";
import Excel from "exceljs";
import {
  formatCep,
  formatCpf,
  formatCurrency,
  formatPhone,
} from "src/utils/string";
import {
  getEnumTitle,
  INTERNAL_USER_TYPE,
  // SCHOOLING_TYPE,
  // MARITAL_STATUS,
  // GENDER_TYPE,
  // NATIONALITY,
} from "src/utils/enums";
import cache from "memory-cache";

initAuth();

const DB_COLLECTION = "associate-data";
const CACHE_KEY = "AFFILIATION_PRINT";
// const CACHE_HOUR = 1;

const handlePrintExcel = async (res) => {
  return new Promise(async (resolve, reject) => {
    try {
      // const cachedResponse = cache.get(CACHE_KEY);
      const db = getFirebaseAdmin().firestore();
      const dbQuery = db
        .collection(DB_COLLECTION)
        .orderBy("affiliationNumber", "desc");

      const dbQueryAddresses = db
        .collection("associate-address")
        .where("status", "!=", "D");
      const addressesResponse = await dbQueryAddresses.get();
      const addressesList = [];

      addressesResponse.forEach((doc) => {
        addressesList.push(doc.data());
      });

      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet("Associados");
      worksheet.columns = [
        //DADOS PESSOAIS & GOVERNAMENTAIS
        { header: "Filiação", key: "affiliationNumber" },
        { header: "Status", key: "status" },
        { header: "Nome", key: "name", width: 45 },
        { header: "E-mail", key: "email", width: 35 },
        { header: "CPF", key: "cpfMasked", width: 25 },
        { header: "Data de Cadastro", key: "createdDate", width: 20 },
        { header: "Status", key: "statusDescription" },
        { header: "Carteira", key: "balance" },
        { header: "Carteira personal", key: "personalClasses" },
        { header: "Tipo", key: "typeDescription", width: 15 },
        { header: "Vencimento de anuidade", key: "nextPayment", width: 20 },
        { header: "Telefone", key: "phoneNumber", width: 25 },
        { header: "Data de Nascimento", key: "birthDate", width: 20 },
        { header: "Número RG", key: "rgNumber", width: 15 },
        { header: "CEP", key: "zipCode", width: 15 },
        { header: "Cidade", key: "city", width: 40 },
        { header: "Número CR", key: "crNumber", width: 15 },
        { header: "Validade CR", key: "validityCR", width: 20 },
        // {
        //   header: "Situação do cadastro",
        //   key: "situationDescription",
        //   width: 22,
        // },
        // { header: "CTF Ibama", key: "ibamaCTF", width: 20 },
        // { header: "Validade CTF", key: "validityCTF", width: 20 },
        // {
        //   header: "Vencimento Psicológico",
        //   key: "psychologicalExamExpiration",
        //   width: 20,
        // },
        // {
        //   header: "Associado a Federação",
        //   key: "federationAssociated",
        //   width: 20,
        // },
        // {
        //   header: "Associado a Confederação",
        //   key: "confederationAssociated",
        //   width: 20,
        // },
        //DOCUMENTOS
        // { header: "Escolaridade", key: "schooling", width: 30 },
        // { header: "Estado Civil", key: "maritalStatus", width: 20 },
        // { header: "Gênero", key: "gender", width: 15 },
        // { header: "Órgão Expedidor", key: "issuingAgency", width: 15 },
        // { header: "Data de Expedição", key: "issueDate", width: 20 },
        // { header: "UF", key: "uf", width: 5 },
        // { header: "Nacionalidade", key: "nationality", width: 15 },
        // { header: "Naturalidade", key: "city", width: 25 },
        // { header: "Título Eleitor", key: "voterTitle", width: 20 },
        //DADOS ADICIONAIS
        // { header: "Empresa", key: "company", width: 20 },
        // { header: "Profissão", key: "occupation", width: 20 },
        // { header: "Nome do Pai", key: "fathersName", width: 35 },
        // { header: "Nome da Mãe", key: "mothersName", width: 35 },
      ];

      worksheet.columns.forEach((column) => {
        if (column.key !== "name") {
          column.alignment = { horizontal: "center", vertical: "middle" };
        }
      });

      let snapshots = null;
      let associates = [];
      // if (cachedResponse) {
      //   console.log("CACHE HIT FOR: ", CACHE_KEY);
      //   associates = cachedResponse;
      // } else {
      snapshots = await dbQuery.get();
      // }

      const iterateList = associates.length ? associates : snapshots.docs;

      for (let i = 0, n = iterateList.length; i < n; i += 1) {
        const associate = iterateList[i].data();
        // const associate = cachedResponse
        //   ? iterateList[i]
        //   : iterateList[i].data();

        associate.id = iterateList[i].id;
        associate.cpfMasked = formatCpf(associate.cpf);
        //DADOS PESSOAIS & GOVERNAMENTAIS
        const affiliationDate = getDateLocalized(
          new Date(associate.affiliationDate),
          "dd/MM/yyyy"
        );
        associate.registerDateMasked = affiliationDate;
        associate.statusDescription =
          associate.active === true ? "Ativo" : "Inativo";
        // associate.situationDescription =
        //   associate.createdBy === "robot" ? "Incompleto" : "Finalizado";
        associate.typeDescription =
          getEnumTitle(INTERNAL_USER_TYPE, associate.internalUserType) || "";
        associate.nextPayment = getDateLocalized(
          new Date(associate.nextPayment),
          "dd/MM/yyyy"
        );
        associate.createdDate = getDateLocalized(
          new Date(associate.createdDate),
          "dd/MM/yyyy"
        );
        associate.balance = formatCurrency(associate.balance) || "N/A";
        associate.personalClasses = associate.personalClasses || "N/A";
        associate.phoneNumber = formatPhone(associate.phoneNumber);
        (associate.affiliationDate = getDateLocalized(affiliationDate)),
          "dd/MM/yyyy";
        associate.crNumber = associate.crNumber || "";
        associate.validityCR = getDateLocalized(
          new Date(associate.validityCR),
          "dd/MM/yyyy"
        );

        // associate.ibamaCTF = associate.ibamaCTF || "";
        // associate.validityCTF = getDateLocalized(
        //   new Date(associate.validityCTF),
        //   "dd/MM/yyyy"
        // );
        // associate.psychologicalExamExpiration = getDateLocalized(
        //   new Date(associate.psychologicalExamExpiration),
        //   "dd/MM/yyyy"
        // );
        // associate.federationAssociated = associate.federationAssociated || "";
        // associate.confederationAssociated =
        //   associate.confederationAssociated || "";
        //DOCUMENTOS
        associate.birthDate = getDateLocalized(
          new Date(associate.birthDate),
          "dd/MM/yyyy"
        );

        // TODO: Find a better way to solve this issue
        /*if (process.env.NODE_ENV !== "development") {
          newDate.setDate(newDate.getDate() + 1);
        }*/

        // associate.schooling =
        //   getEnumTitle(SCHOOLING_TYPE, associate.schooling) || "";
        // associate.maritalStatus =
        //   getEnumTitle(MARITAL_STATUS, associate.maritalStatus) || "";
        // associate.gender = getEnumTitle(GENDER_TYPE, associate.gender) || "";
        associate.rgNumber = associate.rgNumber || "";
        // associate.issuingAgency = associate.issuingAgency || "";
        // associate.issueDate = getDateLocalized(
        //   new Date(associate.issueDate),
        //   "dd/MM/yyyy"
        // );
        // associate.uf = associate.uf || "";
        // associate.nationality =
        //   getEnumTitle(NATIONALITY, associate.nationality) || "";
        // associate.city = associate.city || "";
        // associate.voterTitle = associate.voterTitle || "";
        //DADOS ADICIONAIS
        // associate.company = associate.company || "";
        // associate.occupation = associate.occupation || "";
        // associate.fathersName = associate.fathersName || "";
        // associate.mothersName = associate.mothersName || "";

        if (associate.id) {
          let address = addressesList.find(
            (a) => a.associateId === associate.id && a.type === 1
          );
          if (address && address.zipCode) {
            associate.zipCode = formatCep(address.zipCode);
          }
          if (address && address.city) {
            associate.city = address.state ? `${address.city} - ${address.state}` : address.city;
          }
        }

        worksheet.addRow(associate).commit();
        associates.push(associate);
      }

      // cache.put(CACHE_KEY, associates, CACHE_HOUR * 1000 * 60 * 60);

      const fileName = "associados.xlsx";
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=" + fileName);

      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "cccccc" },
      };

      await workbook.xlsx.write(res);
      res.end();

      resolve();
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
    return handlePrintExcel(res);
  }
};

export default handler;
