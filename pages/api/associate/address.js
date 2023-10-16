import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { verifyAuth } from "src/utils/auth";
import { getDateLocalized } from "src/utils/localizedDateFns";
import { removeMask } from "src/utils/string";

initAuth();

const DB_COLLECTION = "associate-address";

const handleQuery = async (res, query) => {
  try {
    const db = getFirebaseAdmin().firestore();
    let dbQuery = db.collection(DB_COLLECTION).orderBy("status").where("status", "!=", "D").orderBy("type").where("associateId", "==", query.associateId);

    const snapshots = await dbQuery.get();

    const address = [];
    snapshots.forEach((doc) => {
      address.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json(address);
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
      associateId: body.associateId,
      address: body.address,
      complement: body.complement,
      number: body.number,
      city: body.city,
      country: body.country,
      zipCode: removeMask(body.zipCode),
      state: body.state,
      type: body.type,
      neighborhood: body.neighborhood,
      createdBy: body.createdBy,
      createdAt: getDateLocalized(new Date(), 'MM-dd-yyyy hh:mm:ss'),
      createdDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
      createdDateTimestamp: new Date(),
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

    await db.collection(DB_COLLECTION).doc(docId).update({
      status: "D",
      deletedBy: body.deletedBy,
      deletedDate: getDateLocalized(new Date(), 'MM-dd-yyyy hh:mm:ss'),
    });

    return res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handleUpdate = async (res, body) => {
  try {
    const db = getFirebaseAdmin().firestore();
    const docId = body.docId;

    await db
      .collection(DB_COLLECTION)
      .doc(docId)
      .update({
        address: body.address,
        complement: body.complement,
        number: body.number,
        city: body.city,
        country: body.country,
        zipCode: removeMask(body.zipCode),
        state: body.state,
        type: body.type,
        neighborhood: body.neighborhood,
        modifiedBy: body.modifiedBy,
        modifiedDate: getDateLocalized(new Date(), 'MM-dd-yyyy hh:mm:ss'),
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

  if (req.method === "DELETE") {
    return handleDelete(res, body);
  }

  if (req.method === "PUT") {
    return handleUpdate(res, body);
  }
};

export default handler;
