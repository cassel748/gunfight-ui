import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { verifyAuth } from "src/utils/auth";

initAuth();

const DB_COLLECTION = "invoices";

const handleQuery = async (res, query) => {
  try {
    const db = getFirebaseAdmin().firestore();
    let dbQuery = db
      .collection(DB_COLLECTION)
      .where("status", "==", 3)
      .where("associateId", "==", query.associateId);

    const snapshots = await dbQuery.get();

    const invoices = [];
    snapshots.forEach((doc) => {
      invoices.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json(invoices);
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
