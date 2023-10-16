import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { verifyAuth } from "src/utils/auth";
import Firebase from "src/utils/firebase";
import { getDateLocalized } from "src/utils/localizedDateFns";

initAuth();

const DB_COLLECTION = "internal-events";
const DB_COLLECTION_PARTICIPANTS = "internal-events-participants";

const handleQuery = async (res, query) => {
  try {
    const limit = parseInt(query.limit, 10);
    const pageParsed = parseInt(query.page, 10);
    const page = pageParsed === 1 ? 0 : pageParsed * limit - limit;

    //Filter
    const title = query.title;
    const startDate = parseInt(query.startDate, 10);
    const endDate = parseInt(query.endDate, 10);
    const hasFilter = title || startDate || endDate;

    const db = getFirebaseAdmin().firestore();
    let dbQuery = db.collection(DB_COLLECTION);

    if (hasFilter) {
      if (startDate) {
        dbQuery = dbQuery.where("startDate", "==", startDate);
      }
      if (endDate) {
        dbQuery = dbQuery.where("endDate", "==", endDate);
      }
    } else {
      dbQuery = dbQuery.limit(limit);
    }

    const snapshots = await dbQuery
      .orderBy("status")
      .orderBy("title")
      .where("status", "!=", "D")
      .offset(page)
      .get();

    const events = [];
    snapshots.forEach((doc) => {
      events.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    const filtered = events.filter((item) => {
      if (!title) {
        return true;
      }

      if (title && item.title.toLowerCase().indexOf(title.toLowerCase()) > -1) {
        return true;
      }
    });

    const count = hasFilter
      ? filtered.length
      : await Firebase.getCount(DB_COLLECTION);

    return res.status(200).json({
      results: filtered,
      pagination: {
        pages: Math.ceil(count / 10),
        totalCount: count,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handleFind = async (res, id) => {
  try {
    const db = getFirebaseAdmin().firestore();
    let dbQuery = db.collection(DB_COLLECTION).doc(id);

    const response = await dbQuery.get();

    const data = {
      docId: response.id,
      ...response.data(),
    };

    return res.status(200).json(data);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handlePost = async (res, body) => {
  try {
    const db = getFirebaseAdmin().firestore();

    const newItemRef = db.collection(DB_COLLECTION);

    const response = await newItemRef.add({
      status: "A",
      title: body.title,
      startDate: body.startDate,
      endDate: body.endDate,
      description: body.description,
      additionalDescription: body.additionalDescription,
      createdBy: body.createdBy,
      createdAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
      createdDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
      createdDateTimestamp: new Date(),
    });

    await Firebase.updateCount("+", DB_COLLECTION);

    return res.status(200).json({ success: true, createdEventId: response.id });
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

    let dbQuery = db
      .collection(DB_COLLECTION_PARTICIPANTS)
      .orderBy("status")
      .where("status", "!=", "D")
      .where("eventId", "==", docId);

    const snapshots = await dbQuery.get();

    const participants = [];
    snapshots.forEach((doc) => {
      participants.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    for (let i=0,n=participants.length; i<n; i++) {
      const participant = participants[i];

      await db
      .collection(DB_COLLECTION_PARTICIPANTS)
      .doc(participant.docId)
      .update({
        status: "D",
        deletedBy: body.deletedBy,
        deletedAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
        deletedDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
      });
    }

    await Firebase.updateCount("-", DB_COLLECTION);

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
        title: body.title,
        title: body.title,
        startDate: body.startDate,
        endDate: body.endDate,
        description: body.description,
        additionalDescription: body.additionalDescription,
        modifiedBy: body.modifiedBy,
        modifiedAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
        modifiedDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
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

  const id = req.query.id;
  if (req.method === "GET" && id) {
    return handleFind(res, id);
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
