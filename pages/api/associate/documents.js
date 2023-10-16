import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { verifyAuth } from "src/utils/auth";
import { getDateLocalized } from "src/utils/localizedDateFns";

initAuth();

const DB_COLLECTION = "associate-documents";

const handleQuery = async (res, query) => {
  try {
    const db = getFirebaseAdmin().firestore();
    let dbQuery = db
      .collection(DB_COLLECTION)
      .orderBy("status")
      .where("status", "!=", "D")
      .where("associateId", "==", query.associateId);

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
      status: "A",
      document: body.document,
      documentStorageId: body.documentStorageId,
      associateId: body.associateId,
      type: body.type,
      observation: body.observation,
      expireDate: body.expireDate,
      createdBy: body.createdBy,
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

const handlePut = async (res, body) => {
  try {
    const db = getFirebaseAdmin().firestore();
    const newItemRef = db.collection(DB_COLLECTION).doc(body.docId);

    await newItemRef.update({
      expireDate: body.expireDate,
      observation: body.observation,
    });

    return res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handleDelete = async (res, body) => {
  try {
    const db = getFirebaseAdmin().firestore();
    const docId = body.docId;

    await db
      .collection(DB_COLLECTION)
      .doc(docId)
      .update({
        status: "D",
        deletedBy: body.deletedBy,
        deletedAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
        deletedDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
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

  if (req.method === "PUT") {
    return handlePut(res, body);
  }

  if (req.method === "DELETE") {
    return handleDelete(res, body);
  }
};

export default handler;
