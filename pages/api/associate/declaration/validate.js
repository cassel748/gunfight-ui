import { getFirebaseAdmin } from "next-firebase-auth";

const DB_COLLECTION = "associate-declaration";

const handleQuery = async (res, query) => {
  try {
    if (!query.token) {
      return res.status(400).json({
        status: "I"
      });
    }

    const db = getFirebaseAdmin().firestore();
    let dbQuery = db
      .collection(DB_COLLECTION)
      .where("code", "==", query.token)

    const snapshots = await dbQuery.get();

    const declarations = [];
    snapshots.forEach((doc) => {
      declarations.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    let response = null;

    if (declarations && declarations.length) {
      const declaration = declarations[0];
      const isValid = new Date(declaration.createdDate).getTime() <= new Date(declaration.expiration).getTime();

      response = {
        ...declaration,
        status: isValid ? "V" : "E"
      };
    } else {
      response = {
        status: "I"
      }
    }

    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handler = async (req, res) => {
  if (req.method === "GET") {
    return handleQuery(res, req.query);
  }
};

export default handler;
