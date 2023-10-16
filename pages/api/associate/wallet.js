import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { verifyAuth } from "src/utils/auth";
import { FINANCIAL_OPERATION_ENUM } from "src/utils/enums";
import { getDateLocalized } from "src/utils/localizedDateFns";

initAuth();

const DB_COLLECTION = "associate-wallet";

const handleQuery = async (res, query) => {
  try {
    const date = query.date;
    const type = query.type;
    const db = getFirebaseAdmin().firestore();
    let dbQuery =
      db.collection(DB_COLLECTION)
      .orderBy("status")
      .where("status", "!=", "D")
      .orderBy("date", "desc")
      .where("associateId", "==", query.associateId);

    if (date) {
      dbQuery = dbQuery.where("date", "==", date);
    }

    if (type) {
      dbQuery = dbQuery.where("type", "==", type);
    }

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

const handleQueryInventory = async (res, query) => {
  try {
    const db = getFirebaseAdmin().firestore();
    let dbQuery =
      db.collection(DB_COLLECTION)
      .where("status", "==", "A")
      .where("associateId", "==", query.associateId)
      .where("type", "==", 3)
      .where("availableQuantity", ">", 0);

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
    const associateId = body.associateId;
    const value = parseFloat(body.value);
    const type = body.type;
    const db = getFirebaseAdmin().firestore();
    const newItemRef = db.collection(DB_COLLECTION);

    const item = {
      status: "A",
      associateId,
      value,
      type,
      date: body.date,
      description: body.description,
      createdBy: body.createdBy,
      createdAt: getDateLocalized(new Date(), 'MM-dd-yyyy hh:mm:ss'),
      createdDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
      createdDateTimestamp: new Date(),
    };

    if (body.product) {
      item.product = body.product;
      item.quantity = body.quantity;
      item.availableQuantity = body.quantity;
      item.total = body.product.price * body.quantity;
      item.discount = body.discount;
    }

    await newItemRef.add(item);

    const associateDataRef = await db.collection("associate-data").doc(associateId);
    const associateDataItem = await associateDataRef.get();
    const associateData = await associateDataItem.data();

    let newBalance = null;

    if (type === FINANCIAL_OPERATION_ENUM.DEBIT) {
      newBalance = Number((associateData.balance - value).toFixed(2));
    }

    if (type === FINANCIAL_OPERATION_ENUM.CREDIT) {
      newBalance = Number((associateData.balance + value).toFixed(2));
    }

    if (type !== FINANCIAL_OPERATION_ENUM.PRODUCT) {
      if (newBalance !== null) {
        associateDataRef.update({
          balance: newBalance
        });
      } else {
        throw new Error("Can't update balance.");
      }
    }

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
    const associateId = body.associateId;
    const type = body.type;
    const value = body.value;

    await db.collection(DB_COLLECTION).doc(docId).update({
      status: "D",
      deletedBy: body.deletedBy,
      deletedDate: getDateLocalized(new Date(), 'MM-dd-yyyy hh:mm:ss'),
    });

    const associateDataRef = await db.collection("associate-data").doc(associateId);
    const associateDataItem = await associateDataRef.get();
    const associateData = await associateDataItem.data();

    let newBalance = null;

    if (type === FINANCIAL_OPERATION_ENUM.DEBIT) {
      newBalance = Number((associateData.balance + value).toFixed(2));
    }

    if (type === FINANCIAL_OPERATION_ENUM.CREDIT) {
      newBalance = Number((associateData.balance - value).toFixed(2));
    }

    if (type !== FINANCIAL_OPERATION_ENUM.PRODUCT) {
      if (newBalance !== null) {
        associateDataRef.update({
          balance: newBalance
        });
      } else {
        throw new Error("Can't update balance.");
      }
    }

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

  if (req.method === "GET" && req.query.action === "INVENTORY") {
    return handleQueryInventory(res, req.query);
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
};

export default handler;
