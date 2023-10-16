import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth from "src/utils/auth";
import { initAlgolia, getAssociateDataIndex } from "src/utils/algolia";

initAuth();
initAlgolia();

const DB_COLLECTION = "associate-data";

const handleQuery = async (res) => {
  try {
    const db = getFirebaseAdmin().firestore();
    let dbQuery = db.collection(DB_COLLECTION);

    dbQuery = dbQuery.where("createdBy", "==", "robot");
    const snapshots = await dbQuery.get();

    const data = [];
    snapshots.forEach(async (doc) => {
      console.log("Deleting Firestore for: ", doc.id);
      db.collection(DB_COLLECTION).doc(doc.id).delete();
      console.log("Finished Firestore for: ", doc.id);
    });

    try {
      console.log("Deleting Algolia");
      await getAssociateDataIndex().deleteBy({
        filters: `createdBy:robot`
      });
      console.log("Finished Deleting Algolia");
    } catch(e) {
      console.log(e);
    }

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