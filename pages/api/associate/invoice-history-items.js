import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { verifyAuth } from "src/utils/auth";

initAuth();

const DB_COLLECTION = "invoices";
const DB_COLLECTION_ITEMS = "invoice-items";

const handleQuery = async (res, query) => {
  try {
    const db = getFirebaseAdmin().firestore();
    let dbQuery = db
      .collection(DB_COLLECTION)
      .where("associateId", "==", query.associateId);

    const snapshots = await dbQuery.get();

    const invoices = [];
    snapshots.forEach((doc) => {
      invoices.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    const invoiceItems = [];
    let mainTotal = 0;

    for (let i = 0, n = invoices.length; i < n; i++) {
      const invoice = invoices[i];

      let dbQueryItems = db
        .collection(DB_COLLECTION_ITEMS)
        .where("invoiceId", "==", invoice.docId)
        .where("status", "!=", "D");

      const responseItems = await dbQueryItems.get();

      responseItems.forEach((doc) => {
        const itemData = doc.data();

        let itemFinalTotal = itemData.fromInventory
          ? 0
          : itemData.quantity * itemData.productPrice;

        if (itemFinalTotal && itemData.itemDiscount) {
          itemFinalTotal = itemFinalTotal - itemData.itemDiscount;
        }

        if (itemFinalTotal && itemData.applyDiscount) {
          itemFinalTotal =
            itemFinalTotal - itemData.failCount * itemData.productPrice;
        }

        mainTotal += itemFinalTotal;

        invoiceItems.push({
          itemId: doc.id,
          invoiceNumber: invoice.invoiceId,
          ...itemData,
        });
      });
    }

    return res.status(200).json({ mainTotal, invoiceItems });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handler = async (req, res) => {
  const isAuthenticated = await verifyAuth(req, res);

  if (!isAuthenticated) {
    return;
  }

  if (req.method === "GET") {
    return handleQuery(res, req.query);
  }
};

export default handler;
