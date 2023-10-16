import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth from "src/utils/auth";

initAuth();

const handleQuery = async (res, query) => {
  try {
    const collection = query.collection || "invoices";
    const db = getFirebaseAdmin().firestore();
    let dbQuery = db.collection(collection);

    const snapshots = await dbQuery.get();

    const data = [];
    snapshots.forEach(async (doc) => {
      const data = doc.data();
      console.log("Normalizing Firestore for: ", doc.id);
      console.log("SITUATION ====================>", data.createdDate);

      const newDate = new Date(`${data.createdDate} 00:00`);
      await db.collection(collection).doc(doc.id).update({
        createdDateTimestamp: newDate,
      });

      console.log("Finished Firestore for: ", doc.id);
    });

    return res.status(200).json({
      results: data
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
