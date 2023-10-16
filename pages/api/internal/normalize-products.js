import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth from "src/utils/auth";
import { initAlgolia, getProductsIndex } from "src/utils/algolia";
import fs from "fs";
import path from "path";
import { getDateLocalized } from "src/utils/localizedDateFns";

initAuth();
initAlgolia();

const DB_COLLECTION = "internal-products";

const handleQuery = async (res) => {
  try {
    const db = getFirebaseAdmin().firestore();
    let dbQuery = db.collection(DB_COLLECTION);

    const snapshots = await dbQuery.get();

    const data = [];
    snapshots.forEach(async (doc) => {
      const data = doc.data();
      /*console.log("Normalizing Firestore for: ", doc.id);
      console.log("SITUATION -===================>", data.createdDate);
      db.collection(DB_COLLECTION).doc(doc.id).set({
        armamentBond: data.armamentBond,
        bond: data.bond,
        createdAt: data.createdAt,
        createdDate: getDateLocalized(new Date(data.createdAt), "MM-dd-yyyy"),
        createdBy: data.createdBy,
        description: data.description,
        price: parseFloat(data.price),
        status: data.status,
        title: data.title,
        situation: data.situation,
        type: data.type,
      });*/

      try {
        console.log("Deleting Algolia");
        await getProductsIndex().deleteBy({
          filters: `objectID:${doc.id}`
        });
        await getProductsIndex().saveObject({
          objectID: doc.id,
          armamentBond: data.armamentBond,
          bond: data.bond,
          createdAt: data.createdAt,
          createdDate: getDateLocalized(new Date(data.createdAt), "MM-dd-yyyy"),
          createdBy: data.createdBy,
          description: data.description,
          price: parseFloat(data.price),
          status: data.status,
          title: data.title,
          situation: data.situation,
          type: data.type,
          barcode: data.barcode
        });
        console.log("Finished Deleting Algolia");
      } catch(e) {
        console.log(e);
      }
      
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

const handleMerge = async (res) => {
  try {
    const db = getFirebaseAdmin().firestore();
    const dir = path.resolve("products.json");
    let json = fs.readFileSync(dir).toString();

    const products = JSON.parse(json);

    for (let i=0,n=products.length; i<n; i++) {
      const product = products[i];
      const id = product.objectID + "";
      delete product.objectID;

      await db.collection(DB_COLLECTION).doc(id).set(product)
    }

    return res.status(200).json(products);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handler = async (req, res) => {
  const action = req.query.action;
  if (req.method === "GET" && action === "merge") {
    return handleMerge(res, req.query);
  }

  if (req.method === "GET") {
    return handleQuery(res, req.query);
  }
}

export default handler;
