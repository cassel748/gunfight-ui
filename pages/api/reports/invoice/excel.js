import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { verifyAuth } from "src/utils/auth";
import Excel from "exceljs";
import { getDateLocalized } from "src/utils/localizedDateFns";
import { getEnumTitle, TYPE_PRODUCT } from "src/utils/enums";
import InvoiceHub from "src/hubs/InvoiceHub";
import { formatCurrency } from "src/utils/string";

initAuth();

const invoiceHub = new InvoiceHub();

const handlePrintExcel = async (req, res, query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sellerId = query.sellerId;
      const productId = query.productId
        ? query.productId.split(",")
        : undefined;
      const type = query.type ? parseInt(query.type) : undefined;

      const invoices = await invoiceHub.getInvoices({
        initialDate: query.initialDate,
        endDate: query.endDate,
      });

      if (invoices && invoices.length === 0) {
        res.setHeader("Content-Type", "application/json");
        res.status(400).json({
          success: false,
          message:
            "Nenhuma comanda encontrada para o intervalo de datas informado.",
        });
        return reject();
      }

      const invoiceItems = [];

      for (let i = 0, n = invoices.length; i < n; i++) {
        const invoice = invoices[i];

        // if (invoice.items) {
        //   console.log("Invoice has items inside:", invoice.id);
        // }

        const filter = {
          invoiceId: invoice.id,
          sellerId,
          productId,
          productType: type,
        };

        const responseItems = await invoiceHub.getInvoiceItemsMultipleProducts(
          filter
        );

        responseItems.forEach((doc) => {
          invoiceItems.push({
            itemId: doc.id,
            invoiceNumber: invoice.invoiceId,
            associateName: invoice.associateName,
            paymentForm: invoice.paymentForm,
            observation: invoice.observation,
            ...doc.data(),
          });
        });
      }

      if (!invoiceItems || !invoiceItems?.length) {
        res.setHeader("Content-Type", "application/json");
        res.status(400).json({
          success: false,
          message:
            "Nenhum item encontrado para o intervalo de datas informado.",
        });
        return reject();
      }

      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet("Assessoria");
      worksheet.columns = [
        { header: "Tipo", key: "productType", width: 40 },
        { header: "Item", key: "productTitle", width: 65 },
        { header: "Data/Hora", key: "createdAt", width: 25 },
        { header: "Vendedor", key: "sellerName", width: 45 },
        { header: "Pagamento", key: "paymentForm", width: 20 },
        { header: "Associado", key: "associateName", width: 45 },
        { header: "Comanda", key: "invoiceNumber", width: 15 },
        { header: "Quantidade", key: "quantity", width: 15 },
        { header: "Valor Unitário", key: "unitaryValue", width: 15 },
        { header: "Desconto Item", key: "itemDiscount", width: 15 },
        { header: "Valor Total", key: "totalValue", width: 15 },
        { header: "Detalhes da Arma", key: "gunDetail", width: 60 },
        { header: "Descrição", key: "observation", width: 60 },
      ];

      worksheet.columns.forEach((column) => {
        if (column.key !== "productTitle") {
          column.alignment = { horizontal: "center", vertical: "middle" };
        }
      });

      const verifyPaymentForm = (pay) => {
        if (pay === 1) {
          pay = "Débito";
        }
        if (pay === 2) {
          pay = "Crédito";
        }
        if (pay === 3) {
          pay = "Dinheiro";
        }
        if (pay === 4) {
          pay = "Pix";
        }
        if (pay === 5) {
          pay = "Invent/Saldo";
        }
        if (pay === 6) {
          pay = "Mista";
        }
        if (pay === undefined) {
          pay = "----";
        }
        return pay;
      };

      for (let item of invoiceItems) {
        const product = item;

        const verifyInfos =
          product.modelWeapon ||
          product.serialNumber ||
          product.transferOf ||
          product.transferTo;

        const gunDetails = verifyInfos
          ? product?.modelWeapon +
            ", N: Série: " +
            product?.serialNumber +
            ", De: " +
            product?.transferOf +
            ", Para: " +
            product?.transferTo
          : "";

        const itemSubtotal = product.fromInventory
          ? 0
          : product.quantity * product.productPrice;
        let itemFinalTotal = itemSubtotal;

        if (itemFinalTotal && product.itemDiscount) {
          itemFinalTotal = itemFinalTotal - product.itemDiscount;
        }

        if (itemFinalTotal && product.applyDiscount) {
          itemFinalTotal =
            itemFinalTotal - product.failCount * product.productPrice;
        }

        let productType = product.productType;
        if (productType === "click") {
          productType = 2;
        }

        const productTypeParsed = parseInt(productType, 10);
        const productTypeDescription = getEnumTitle(
          TYPE_PRODUCT,
          productTypeParsed
        );

        product.productType = productTypeDescription || "";
        product.productTitle = product.productTitle || "";
        product.createdAt =
          getDateLocalized(new Date(product.createdAt), "dd/MM/yyyy - hh:mm") ||
          "";
        product.sellerName = product.sellerName || "";
        product.paymentForm = verifyPaymentForm(product.paymentForm) || "";
        product.associateName = product.associateName || "";
        product.invoiceNumber = product.invoiceNumber || "";
        product.quantity = product.quantity || "";
        product.unitaryValue = formatCurrency(product.productPrice) || "";
        product.itemDiscount = product.itemDiscount
          ? formatCurrency(product.itemDiscount)
          : "Não";
        product.totalValue = product.fromInventory
          ? formatCurrency(0)
          : formatCurrency(itemFinalTotal);
        product.gunDetail = product.gunDetail || "" + gunDetails;
        product.observation = product.observation || "";

        worksheet.addRow(product).commit();
      }

      const fileName = "assessoria.xlsx";
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
    return handlePrintExcel(req, res, req.query);
  }
};

export default handler;
