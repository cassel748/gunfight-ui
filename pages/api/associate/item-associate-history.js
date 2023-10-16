import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { verifyAuth } from "src/utils/auth";
import { getDateLocalized } from "src/utils/localizedDateFns";

initAuth();

const DB_COLLECTION = "item-associate-history";

const handleQuery = async (res, query) => {
  try {
    const db = getFirebaseAdmin().firestore();
    let dbQuery = db
      .collection(DB_COLLECTION)
      .orderBy("date", "desc")

    const snapshots = await dbQuery.get();

    const documents = [];
    snapshots.forEach((doc) => {
      documents.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json(documents);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handlePost = async (res, body) => {
  try {
    const db = getFirebaseAdmin().firestore();
    const newItemRef = db.collection(DB_COLLECTION);

    await newItemRef.add({
      date: body.date,
      item: body.item,
      total: body.total,
      discount: body.discount,
      quantity: body.quantity,
      unitValue: body.unitValue,
      associateId: body.associateId,
      commandNumber: body.commandNumber,
      createdAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
      createdDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
      createdDateTimestamp: new Date(),
    });

    return res.status(200).json({ success: true });
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

  const body = JSON.parse(req.body);

  if (req.method === "POST") {
    return handlePost(res, body);
  }

};

export default handler;
