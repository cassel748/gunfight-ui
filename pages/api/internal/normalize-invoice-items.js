import { getFirebaseAdmin } from "next-firebase-auth";
import InvoiceHub from "src/hubs/InvoiceHub";
import initAuth from "src/utils/auth";

const invoiceHub = new InvoiceHub();

const handleQuery = async (res, query) => {
  await initAuth();

  try {
    const db = getFirebaseAdmin().firestore();

    const invoices = await invoiceHub.getInvoices({
      initialDate: query.initialDate || "09-01-2022",
      endDate: query.endDate || "09-30-2022",
    });

    for (let i = 0, n = invoices.length; i < n; i++) {
      const invoice = invoices[i];
    
      const filter = {
        invoiceId: invoice.id,
      };

      const responseItems = await invoiceHub.getInvoiceItems(filter);
      const items = [];

      responseItems.forEach((doc) => {
        const item = doc.data();
        items.push(item);
      });

      console.log("Updating invoice:", invoice.id);

      await db.collection("invoices").doc(invoice.id).update({
        items,
      });

      console.log("Finished updating invoice:", invoice.id);
    }

    return res.status(200).json({
      results: invoices,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handler = async (req, res) => {
  if (req.method === "GET") {
    return handleQuery(res, req.query);
  }
}

export default handler;
