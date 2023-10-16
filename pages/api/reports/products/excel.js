import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { verifyAuth } from "src/utils/auth";
import Excel from "exceljs";
import { formatCurrency } from "src/utils/string";

initAuth();

const DB_COLLECTION = "internal-products";

const handlePrintExcel = async (res) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = getFirebaseAdmin().firestore();
      const dbQuery = db.collection(DB_COLLECTION).orderBy("title", "asc");

      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet("Produtos");
      worksheet.columns = [
        { header: "Título", key: "title", width: 65 },
        { header: "Valor", key: "price", width: 20 },
        { header: "Tipo", key: "type", width: 35 },
        { header: "Tamanho", key: "size", width: 15 },
        { header: "Status", key: "status", width: 10 },
        { header: " ", key: "inventoryQuantity", width: 15 },
        { header: "Descrição", key: "description", width: 100 },
      ];

      worksheet.columns.forEach((column) => {
        if (column.key !== "title") {
          column.alignment = { horizontal: "center", vertical: "middle" };
        }
      });

      const verifyTypeItem = (type) => {
        if (type === 1) {
          type = "Loja vestuário/acessórios";
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

      let snapshots = null;
      let products = [];
      snapshots = await dbQuery.get();

      const iterateList = products.length ? products : snapshots.docs;

      for (let i = 0, n = iterateList.length; i < n; i += 1) {
        const product = iterateList[i].data();

        product.title = product.title || "";
        product.price = formatCurrency(product.price) || "";
        product.type = verifyTypeItem(product.type) || "";
        product.size = product.size || "";
        product.status = verifyStatus(product.status) || "";
        product.inventoryQuantity = product.inventoryQuantity || "";
        product.description = product.description || "";

        worksheet.addRow(product).commit();
        products.push(iterateList);
      }

      const fileName = "produtos.xlsx";
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
