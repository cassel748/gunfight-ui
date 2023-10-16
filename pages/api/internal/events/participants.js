import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { verifyAuth } from "src/utils/auth";
import { getDateLocalized } from "src/utils/localizedDateFns";

initAuth();

const DB_COLLECTION = "internal-events-participants";

const handleQuery = async (res, query) => {
  try {
    //Filter
    const eventId = query.eventId;

    const db = getFirebaseAdmin().firestore();
    let dbQuery = db.collection(DB_COLLECTION);

    const snapshots = await dbQuery
      .orderBy("status")
      .where("status", "!=", "D")
      .where("eventId", "==", eventId)
      .get();

    const participants = [];
    snapshots.forEach((doc) => {
      participants.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json({
      results: participants
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handlePost = async (res, body) => {
  try {
    const db = getFirebaseAdmin().firestore();
    
    const participantsToAdd = body.participants;

    const messages = [];

    for (let i=0,n=participantsToAdd.length; i<n; i++) {
      const participant = participantsToAdd[i];
      const newItemRef = db.collection(DB_COLLECTION);

      try {
        let dbQuery = db.collection(DB_COLLECTION);
        const snapshots = await dbQuery
          .orderBy("status")
          .where("status", "!=", "D")
          .where("eventId", "==", body.eventId)
          .where("associateId", "==", participant.objectID)
          .get();

        const participants = [];
        snapshots.forEach(() => {
          participants.push(true);
        });

        if (participants && participants.length) {
         console.log(`Associate with ID ${participant.objectID} is already on this event, skipping...`);
         messages.push({ message: `Associado ${participant.name} já está nesse evento`, type: "error" });
         continue;
        }

        await newItemRef.add({
          status: "A",
          associateId: participant.objectID,
          name: participant.name,
          cpf: participant.cpf,
          crNumber: participant.crNumber,
          createdBy: body.createdBy,
          eventId: body.eventId,
          createdAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
          createdDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
          createdDateTimestamp: new Date(),
        });

        messages.push({ message: `Associado ${participant.name} adicionado com sucesso`, type: "success" });
      } catch(e) {
        console.log(e);
      }
    }

    return res.status(200).json({ success: true, messages });
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

  if (req.method === "DELETE") {
    return handleDelete(res, body);
  }
};

export default handler;
