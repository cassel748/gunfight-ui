import { getFirebaseAdmin } from "next-firebase-auth";
import { getUsersIndex, initAlgolia } from "src/utils/algolia";
import initAuth, { USER_TYPE, verifyAuth } from "src/utils/auth";
import Firebase from "src/utils/firebase";
import { getDateLocalized } from "src/utils/localizedDateFns";

initAuth();
initAlgolia();

const DB_COLLECTION = "user-data";

const handleQuery = async (res, query) => {
  try {
    const limit = parseInt(query.limit, 10);
    const pageParsed = parseInt(query.page, 10);
    const page = pageParsed === 1 ? 0 : pageParsed * limit - limit;

    // Filter
    const name = query.name;
    const email = query.email;
    const accessLevel = parseInt(query.accessLevel, 10);
    const hasFilter = name || email || accessLevel;

    const db = getFirebaseAdmin().firestore();
    let dbQuery = db.collection(DB_COLLECTION);

    if (hasFilter) {
      if (email) {
        dbQuery = dbQuery.where("email", "==", email);
      }

      if (accessLevel) {
        dbQuery = dbQuery.where("accessLevel", "==", accessLevel);
      }
    } else {
      dbQuery = dbQuery.limit(limit);
    }

    const snapshots = await dbQuery
      .where("accessLevel", "!=", 99)
      .where("status", "==", "A")
      .orderBy("accessLevel", "desc")
      .orderBy("name", "asc")
      .offset(page)
      .get();

    const users = [];
    snapshots.forEach((doc) => {
      users.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    const filtered = users.filter((item) => {
      if (!name) {
        return true;
      }

      if (name && item.name.toLowerCase().indexOf(name.toLowerCase()) > -1) {
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
    const auth = getFirebaseAdmin().auth();

    const createdUser = await auth.createUser({
      email: body.email,
      emailVerified: false,
      password: body.password,
      disabled: false,
    });

    const uid = createdUser.uid;
    const newItemRef = db.collection(DB_COLLECTION).doc(uid);

    const userData = {
      active: "A",
      status: "A",
      name: body.name,
      accessLevel: body.accessLevel,
      email: body.email,
      phoneNumber: body.phoneNumber,
      userPhoto: body.userPhoto || "",
      userPhotoStorageId: body.userPhotoStorageId || "",
      createdBy: body.createdBy,
      createdDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
      createdDateTimestamp: new Date(),
      createdAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
      active: true,
    }

    await newItemRef.set(userData);

    try {
      // Algolia should have objectID to allow update
      await getUsersIndex().saveObject({
        ...userData,
        objectID: uid
      });
    } catch(e) {
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
    const auth = getFirebaseAdmin().auth();
    const id = body.docId;

    try {
      await auth.deleteUser(id);
    } catch(err) {
      console.log("unable to delete user in firebase auth");
    }

    await db
      .collection(DB_COLLECTION)
      .doc(id)
      .update({
        status: "D",
        deletedBy: body.deletedBy,
        deletedAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
        deletedDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
      });


    await getUsersIndex().partialUpdateObject({
      status: "D",
      objectID: id,
      deletedBy: body.deletedBy,
      deletedDate: getDateLocalized(new Date(), 'MM-dd-yyyy hh:mm:ss'),
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
    const auth = getFirebaseAdmin().auth();
    const id = body.docId;

    if (body.password) {
      await auth.updateUser(id, {
        password: body.password,
        disabled: !body.active,
      });
    }

    const data = {
      name: body.name,
      phoneNumber: body.phoneNumber,
      modifiedBy: body.modifiedBy,
      userPhoto: body.userPhoto,
      userPhotoStorageId: body.userPhotoStorageId,
      modifiedAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
      modifiedDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
      active: !!body.active,
    }

    // Only administrator can change user type
    if (user.accessLevel >= USER_TYPE.ADMINISTRATOR) {
      data.accessLevel =  body.accessLevel;
    }

    await db
      .collection(DB_COLLECTION)
      .doc(id)
      .update(data);

    try {
      // Algolia should have objectID to allow update
      const algoliaData = {
        name: body.name,
        phoneNumber: body.phoneNumber,
        modifiedBy: body.modifiedBy,
        userPhoto: body.userPhoto,
        userPhotoStorageId: body.userPhotoStorageId,
        modifiedAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
        modifiedDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
        active: !!body.active,
        objectID: id
      };

      // Only administrator can change user type
      if (user.accessLevel >= USER_TYPE.ADMINISTRATOR) {
        algoliaData.accessLevel =  body.accessLevel;
      }

      await getUsersIndex().partialUpdateObject(algoliaData, { createIfNotExists: true });
    } catch(e) {
      console.log(e);
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handleSearch = async (res, search) => {
  try {
    const response = await getUsersIndex().search(search, {
      filters: "active:true",
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
      facets: [
        "*"
      ]
    });
    return res.status(200).json({ success: true, ...response });
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
