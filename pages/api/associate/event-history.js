import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { verifyAuth } from "src/utils/auth";

initAuth();

const DB_COLLECTION = "associate-events";

const handleQuery = async (res, query) => {
  try {
    const db = getFirebaseAdmin().firestore();
    let dbQuery = db
      .collection(DB_COLLECTION)
      .orderBy("status")
      .where("status", "!=", "D")
      .where("associateId", "==", query.associateId);

    const snapshots = await dbQuery.get();

    const events = [];
    snapshots.forEach((doc) => {
      events.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json(events);
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
