import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { verifyAuth } from "src/utils/auth";
import { getDateLocalized } from "src/utils/localizedDateFns";

initAuth();

const DB_COLLECTION = "associate-weapons";

const handleQuery = async (res, query) => {
  try {
    const db = getFirebaseAdmin().firestore();
    let dbQuery = db
      .collection(DB_COLLECTION)
      .orderBy("status")
      .orderBy("model")
      .where("status", "!=", "D")
      .where("associateId", "==", query.associateId);

    const snapshots = await dbQuery.get();

    const weapons = [];
    snapshots.forEach((doc) => {
      weapons.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json(weapons);
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
      brand: body.brand,
      model: body.model,
      caliber: body.caliber,
      species: body.species,
      serialNumber: body.serialNumber,
      crafRegister: body.crafRegister,
      crafExpireDate: body.crafExpireDate,
      militaryRegion: body.militaryRegion,
      sigmaSinarmNumber: body.sigmaSinarmNumber,
      trafficGuideNumber: body.trafficGuideNumber,
      crafExpeditionDate: body.crafExpeditionDate,
      oldTrafficGuideExpireDate: body.oldTrafficGuideExpireDate,
      atualTrafficGuideExpireDate: body.atualTrafficGuideExpireDate,

      origin: body.origin,
      status: body.status,
      rfaRegisterNumber: body.rfaRegisterNumber,
      rfaSinarmRegistrationNumber: body.rfaSinarmRegistrationNumber,
      rfaRegisterExpireDate: body.rfaRegisterExpireDate,
      pfaCertificateNumber: body.pfaCertificateNumber,
      pfaExpedition: body.pfaExpedition,
      pfaCategory: body.pfaCategory,
      pfaCoverage: body.pfaCoverage,
      pfaExpeditionDate: body.pfaExpeditionDate,
      pfaExpiraDate: body.pfaExpiraDate,

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

const handleUpdate = async (res, body) => {
  try {
    const db = getFirebaseAdmin().firestore();
    const docId = body.docId;

    await db
      .collection(DB_COLLECTION)
      .doc(docId)
      .update({
        brand: body.brand,
        model: body.model,
        caliber: body.caliber,
        species: body.species,
        serialNumber: body.serialNumber,
        crafExpireDate: body.crafExpireDate,
        crafRegister: body.crafRegister,
        militaryRegion: body.militaryRegion,
        sigmaSinarmNumber: body.sigmaSinarmNumber,
        trafficGuideNumber: body.trafficGuideNumber,
        crafExpeditionDate: body.crafExpeditionDate,
        oldTrafficGuideExpireDate: body.oldTrafficGuideExpireDate,
        atualTrafficGuideExpireDate: body.atualTrafficGuideExpireDate || "",

        origin: body.origin,
        status: body.status,
        rfaRegisterNumber: body.rfaRegisterNumber,
        rfaSinarmRegistrationNumber: body.rfaSinarmRegistrationNumber,
        rfaRegisterExpireDate: body.rfaRegisterExpireDate,
        pfaCertificateNumber: body.pfaCertificateNumber,
        pfaExpedition: body.pfaExpedition,
        pfaCategory: body.pfaCategory,
        pfaCoverage: body.pfaCoverage,
        pfaExpeditionDate: body.pfaExpeditionDate,
        pfaExpiraDate: body.pfaExpiraDate,

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
