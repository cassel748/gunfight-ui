import { getFirebaseAdmin } from "next-firebase-auth";
import { getProductsIndex, initAlgolia } from "src/utils/algolia";
import initAuth, { verifyAuth } from "src/utils/auth";
import Firebase from "src/utils/firebase";
import { getDateLocalized } from "src/utils/localizedDateFns";

initAuth();
initAlgolia();

const DB_COLLECTION = "internal-products";

const handleQuery = async (res, query) => {
  try {
    const limit = parseInt(query.limit, 10);
    const pageParsed = parseInt(query.page, 10);
    const page = pageParsed === 1 ? 0 : pageParsed * limit - limit;

    //Filter
    const title = query.title;
    const type = parseInt(query.type, 10);
    const situation = parseInt(query.situation, 10);
    const hasFilter = title || type || situation;

    const db = getFirebaseAdmin().firestore();
    let dbQuery = db.collection(DB_COLLECTION);

    if (hasFilter) {
      if (type) {
        dbQuery = dbQuery.where("type", "==", type);
      }

      if (situation) {
        dbQuery = dbQuery.where("situation", "==", situation);
      }
    } else {
      dbQuery = dbQuery.limit(limit);
    }

    const snapshots = await dbQuery
      .orderBy("status")
      .orderBy("title")
      // .orderBy("type")
      .where("status", "!=", "D")
      .offset(page)
      .get();

    const products = [];
    snapshots.forEach((doc) => {
      products.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    const filtered = products.filter((item) => {
      if (!title) {
        return true;
      }

      if (title && item.title.toLowerCase().indexOf(title.toLowerCase()) > -1) {
        return true;
      }

      if (type && item.type.toLowerCase().indexOf(type.toLowerCase()) > -1) {
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

const handleSearch = async (res, search) => {
  try {
    const response = await getProductsIndex().search(search, {
      filters: "status:A",
      getRankingInfo: false,
      analytics: false,
      enableABTest: false,
      hitsPerPage: 300,
      attributesToRetrieve: "*",
      attributesToSnippet: "*:20",
      snippetEllipsisText: "…",
      responseFields: "*",
      explain: "*",
      page: 0,
      facets: ["*"],
    });
    return res.status(200).json({ success: true, ...response });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handlePost = async (res, body) => {
  try {
    const db = getFirebaseAdmin().firestore();

    const newItemRef = db.collection(DB_COLLECTION);

    const price = parseFloat(body.price);

    const productsPost = {
      status: "A",
      title: body.title,
      price,
      productCode: body.productCode,
      size: body.size,
      color: body.color,
      type: body.type,
      description: body.description,
      situation: body.situation,
      bond: body.bond,
      armamentBond: body.armamentBond,
      eventAttached: body.eventAttached,
      barcode: body.barcode,
      inventoryQuantity: body.inventoryQuantity,
      minimumInventoryQuantity: body.minimumInventoryQuantity,
      createdBy: body.createdBy,
      createdAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
      createdDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
      createdDateTimestamp: new Date(),
    };

    const response = await newItemRef.add(productsPost);

    try {
      // Algolia should have objectID to allow update
      await getProductsIndex().saveObject({
        ...productsPost,
        objectID: response.id,
      });
    } catch (e) {
      console.log(e);
    }

    await Firebase.updateCount("+", DB_COLLECTION);

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

    await getProductsIndex().partialUpdateObject({
      status: "D",
      objectID: docId,
      deletedBy: body.deletedBy,
      deletedAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
      deletedDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
    });

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

    const price = parseFloat(body.price);

    const productsUpdate = {
      title: body.title,
      price,
      productCode: body.productCode,
      size: body.size,
      color: body.color,
      type: body.type,
      description: body.description,
      situation: body.situation,
      bond: body.bond,
      armamentBond: body.armamentBond,
      eventAttached: body.eventAttached,
      barcode: body.barcode,
      inventoryQuantity: body.inventoryQuantity,
      minimumInventoryQuantity: body.minimumInventoryQuantity,
      modifiedBy: body.modifiedBy,
      modifiedAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
      modifiedDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
    };

    if (body.type !== 4) {
      productsUpdate.bond = null;
      productsUpdate.armamentBond = null;
    }

    await db.collection(DB_COLLECTION).doc(docId).update(productsUpdate);

    try {
      // Algolia should have objectID to allow update
      await getProductsIndex().partialUpdateObject(
        {
          ...productsUpdate,
          objectID: docId,
        },
        { createIfNotExists: true }
      );
    } catch (e) {
      console.log(e);
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

  const search = req.query.search;
  if (req.method === "GET" && search !== undefined) {
    return handleSearch(res, search);
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
