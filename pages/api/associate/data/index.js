import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { getUserSession, verifyAuth } from "src/utils/auth";
import Firebase from "src/utils/firebase";
import { initAlgolia, getAssociateDataIndex } from "src/utils/algolia";
import { getDateLocalized } from "src/utils/localizedDateFns";
import { generateFilterQuery } from "src/utils/query";
import { INTERNAL_USER_TYPE } from "src/utils/enums";
import cache from "memory-cache";

initAuth();
initAlgolia();

const DB_COLLECTION = "associate-data";
const CACHE_KEY = "ASSOCIATES_CHART_CACHE";
const CACHE_KEY_TIMER = "ASSOCIATES_CHART_CACHE_TIMESTAMP";
const CACHE_HOUR = 1;

const handleQuery = async (res, query) => {
  try {
    const limit = parseInt(query.limit, 10);
    const page = parseInt(query.page, 10);

    // Filter
    const name = query.name;
    const internalUserType = query.internalUserType;
    const phoneNumber = query.phoneNumber;
    const cpf = query.cpf;
    const active = query.active;
    const spouseName = query.spouseName;

    const index = await getAssociateDataIndex();
    await index.setSettings({
      paginationLimitedTo: 6000,
    });

    const filter = {
      status: "!D",
    };

    if (phoneNumber) {
      filter.phoneNumber = phoneNumber;
    }
    if (spouseName) {
      filter.spouseName = spouseName;
    }
    if (cpf) {
      filter.cpf = cpf;
    }

    if (active !== undefined) {
      filter.active = active;
    }

    if (internalUserType !== undefined) {
      filter.internalUserType = internalUserType;
    }

    const filters = generateFilterQuery(filter);
    const response = await index.search(name, {
      filters,
      getRankingInfo: false,
      analytics: false,
      enableABTest: false,
      hitsPerPage: limit,
      attributesToRetrieve: "*",
      attributesToSnippet: "*:20",
      snippetEllipsisText: "…",
      responseFields: "*",
      explain: "*",
      page,
    });

    return res.json({
      data: response,
      results: response.hits,
      pagination: {
        pages: response.nbPages,
        totalCount: response.nbHits,
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
      id: response.id,
      ...response.data(),
    };

    return res.status(200).json(data);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const getLastAssociateNumber = async () => {
  const response = await getAssociateDataIndex().search("", {
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
    facets: ["affiliationNumber"],
  });
  return response.facets_stats.affiliationNumber.max + 1;
};

const handleChartData = async (res) => {
  try {
    const cacheResponse = cache.get(CACHE_KEY);
    const cachedTime = cache.get(CACHE_KEY_TIMER) ?? 0;
    const db = getFirebaseAdmin().firestore();
    const dbQuery = db
      .collection(DB_COLLECTION)
      .orderBy("affiliationNumber", "desc");

    let data = {};
    const actualTimestamp = new Date().getTime();
    const mayCacheUpdate =
      actualTimestamp - cachedTime > CACHE_HOUR * 1000 * 60 * 60;

    if (cacheResponse && cacheResponse.length > 0 && !mayCacheUpdate) {
      data = cacheResponse;
    } else {
      let cacheTotal = cacheResponse?.total ?? 0;
      let cacheInactiveTotal = cacheResponse?.inactiveTotal ?? 0;
      let cacheActiveTotal = cacheResponse?.activeTotal ?? 0;

      let associatesList = [];
      const response = await dbQuery.get();
      response.forEach((doc) => {
        associatesList.push(doc.data());
      });

      const responseAddresses = await db
        .collection("associate-address")
        .where("status", "!=", "D")
        .where("type", "==", 1)
        .get();

      data.addressesNumber = responseAddresses.size
        ? responseAddresses.size
        : null;

      let userTypes = {};
      data.total = associatesList?.length;
      INTERNAL_USER_TYPE.forEach((userType) => {
        userTypes[userType.title] = associatesList.filter(
          (associate) => associate.internalUserType == userType.value
        )?.length;
      });

      data.userTypes = userTypes;

      data.activeTotal = associatesList.filter(
        (associate) => associate.active
      )?.length;
      data.inactiveTotal = associatesList.filter(
        (associate) => !associate.active
      )?.length;

      data.totalGrowth =
        cacheTotal > 0 ? (data.total - cacheTotal) / cacheTotal : 0;
      data.activeGrowth =
        cacheActiveTotal > 0
          ? (data.activeTotal - cacheActiveTotal) / cacheActiveTotal
          : 0;
      data.inactiveGrowth =
        cacheInactiveTotal > 0
          ? (data.inactiveTotal - cacheInactiveTotal) / cacheInactiveTotal
          : 0;

      cache.del(CACHE_KEY);
      cache.put(CACHE_KEY, data);
      cache.del(CACHE_KEY_TIMER);
      cache.put(CACHE_KEY_TIMER, new Date().getTime());
    }

    return res.status(200).json(data);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handlePost = async (res, body) => {
  try {
    try {
      getFirebaseAdmin().firestore().settings({
        ignoreUndefinedProperties: true,
      });
    } catch (e) {}

    const db = getFirebaseAdmin().firestore();
    const newItemRef = db.collection(DB_COLLECTION);

    const affiliationNumber = await getLastAssociateNumber();

    const associateData = {
      status: body.status ? body.status : "A",
      affiliationNumber: affiliationNumber,
      balance: 0,
      active:
        body.active !== undefined && body.active !== "" ? body.active : true,
      cpf: body.cpf,
      name: body.name,
      birthDate: body.birthDate,
      email: body.email,
      phoneNumber: body.phoneNumber,
      company: body.company,
      occupation: body.occupation,
      fathersName: body.fathersName,
      mothersName: body.mothersName,
      spouse: body.spouse,
      spouseName: body.spouseName,
      affiliationDate: body.affiliationDate,
      nextPayment: body.nextPayment,
      crNumber: body.crNumber,
      validityCR: body.validityCR,
      ibamaCTF: body.ibamaCTF,
      validityCTF: body.validityCTF,
      psychologicalExamExpiration: body.psychologicalExamExpiration,
      schooling: body.schooling,
      maritalStatus: body.maritalStatus,
      gender: body.gender,
      nationality: body.nationality,
      city: body.city,
      uf: body.uf,
      observations: body.observations,
      rgNumber: body.rgNumber,
      issuingAgency: body.issuingAgency,
      issueDate: body.issueDate,
      voterTitle: body.voterTitle,
      federationAssociated: body.federationAssociated,
      confederationAssociated: body.confederationAssociated,
      category: body.category,
      profilePhoto: body.profilePhoto || "",
      profilePhotoStorageId: body.profilePhotoStorageId || "",
      createdBy: body.createdBy,
      internalUserType: body.internalUserType,
      personalClasses: 0,
      createdAt: getDateLocalized(new Date(), "MM-dd-yyyy hh:mm:ss"),
      createdDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
      createdDateTimestamp: new Date(),
    };
    const response = await newItemRef.add(associateData);

    try {
      // Algolia should have objectID to allow update
      await getAssociateDataIndex().saveObject({
        cpf: body.cpf,
        name: body.name,
        birthDate: body.birthDate,
        affiliationDate: body.affiliationDate,
        email: body.email,
        phoneNumber: body.phoneNumber,
        nextPayment: body.nextPayment,
        spouse: body.spouseName,
        rgNumber: body.rgNumber,
        observations: body.observations,
        spouseName: body.spouseName,
        crNumber: body.crNumber,
        active: true,
        status: body.status ? body.status : "A",
        affiliationNumber: affiliationNumber,
        objectID: response.id,
        createdBy: body.createdBy,
        internalUserType: body.internalUserType,
        createdAt: getDateLocalized(new Date(), "MM-dd-yyyy hh:mm:ss"),
        createdDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
        createdDateTimestamp: new Date(),
      });
    } catch (e) {
      console.log(e);
    }

    await Firebase.updateCount("+", DB_COLLECTION);

    return res
      .status(200)
      .json({ success: true, createdUserId: response.id, cpf: body.cpf });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handleDelete = async (res, body) => {
  try {
    const db = getFirebaseAdmin().firestore();
    const id = body.id;

    // Delete associate data
    await db
      .collection(DB_COLLECTION)
      .doc(id)
      .update({
        status: "D",
        deletedBy: body.deletedBy,
        deletedDate: getDateLocalized(new Date(), "MM-dd-yyyy hh:mm:ss"),
      });

    await getAssociateDataIndex().partialUpdateObject({
      status: "D",
      objectID: id,
      deletedBy: body.deletedBy,
      deletedDate: getDateLocalized(new Date(), "MM-dd-yyyy hh:mm:ss"),
    });

    await Firebase.updateCount("-", DB_COLLECTION);

    // Delete associate weapons
    const weaponsQuery = db
      .collection("associate-weapons")
      .where("id", "==", id);
    const weaponsResponse = await weaponsQuery.get();

    weaponsResponse.forEach(async (doc) => {
      await db
        .collection("associate-weapons")
        .doc(doc.id)
        .set({
          status: "D",
          ...doc.data(),
          deletedBy: body.deletedBy,
          deletedDate: getDateLocalized(new Date(), "MM-dd-yyyy hh:mm:ss"),
        });
    });

    // Delete associate address
    const addressQuery = db
      .collection("associate-address")
      .where("id", "==", id);
    const addressResponse = await addressQuery.get();

    addressResponse.forEach(async (doc) => {
      await db
        .collection("associate-address")
        .doc(doc.id)
        .set({
          status: "D",
          ...doc.data(),
          deletedBy: body.deletedBy,
          deletedDate: getDateLocalized(new Date(), "MM-dd-yyyy hh:mm:ss"),
        });
    });

    // Delete associate contact history
    const contactHistoryQuery = db
      .collection("associate-contact-history")
      .where("id", "==", id);
    const contactHistoryQueryResponse = await contactHistoryQuery.get();

    contactHistoryQueryResponse.forEach(async (doc) => {
      await db
        .collection("associate-contact-history")
        .doc(doc.id)
        .set({
          status: "D",
          ...doc.data(),
          deletedBy: body.deletedBy,
          deletedDate: getDateLocalized(new Date(), "MM-dd-yyyy hh:mm:ss"),
        });
    });

    return res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handleUpdate = async (req, res, body) => {
  try {
    const db = getFirebaseAdmin().firestore();
    const id = body.id || body.docId;

    const associateRef = await db.collection(DB_COLLECTION).doc(id);

    const associateData = await associateRef.get();
    const associatePreviousData = associateData.data();

    const fieldsToUpdate = {
      name: body.name,
      birthDate: body.birthDate,
      email: body.email,
      phoneNumber: body.phoneNumber,
      company: body.company,
      occupation: body.occupation,
      fathersName: body.fathersName,
      mothersName: body.mothersName,
      spouse: body.spouse,
      spouseName: body.spouseName,
      affiliationDate: body.affiliationDate,
      nextPayment: body.nextPayment,
      crNumber: body.crNumber,
      validityCR: body.validityCR,
      ibamaCTF: body.ibamaCTF,
      validityCTF: body.validityCTF,
      psychologicalExamExpiration: body.psychologicalExamExpiration,
      schooling: body.schooling,
      maritalStatus: body.maritalStatus,
      gender: body.gender,
      nationality: body.nationality,
      city: body.city,
      uf: body.uf,
      rgNumber: body.rgNumber,
      observations: body.observations,
      issuingAgency: body.issuingAgency,
      issueDate: body.issueDate,
      voterTitle: body.voterTitle,
      federationAssociated: body.federationAssociated,
      confederationAssociated: body.confederationAssociated,
      category: body.category,
      active: body.active,
      internalUserType: body.internalUserType,
      modifiedBy: body.modifiedBy,
      modifiedDate: getDateLocalized(new Date(), "MM-dd-yyyy hh:mm:ss"),
    };

    // Only Super(99) and Admin(3) can update CPF
    const userData = getUserSession();
    if (userData && userData.accessLevel > 2) {
      fieldsToUpdate.cpf = body.cpf;
    }

    if (body.profilePhoto) {
      fieldsToUpdate.profilePhoto = body.profilePhoto;
    }

    if (body.profilePhotoStorageId) {
      fieldsToUpdate.profilePhotoStorageId = body.profilePhotoStorageId;
    }

    await associateRef.update(fieldsToUpdate);

    try {
      // Algolia should have objectID to allow update
      await getAssociateDataIndex().partialUpdateObject(
        {
          cpf: body.cpf,
          name: body.name,
          birthDate: body.birthDate,
          affiliationDate: body.affiliationDate,
          affiliationNumber: body.affiliationNumber,
          email: body.email,
          phoneNumber: body.phoneNumber,
          nextPayment: body.nextPayment,
          rgNumber: body.rgNumber,
          crNumber: body.crNumber,
          active: body.active,
          objectID: id,
          spouseName: body.spouseName,
          internalUserType: body.internalUserType,
          modifiedBy: body.modifiedBy,
          modifiedDate: getDateLocalized(new Date(), "MM-dd-yyyy hh:mm:ss"),
        },
        { createIfNotExists: true }
      );
    } catch (e) {
      console.log(e);
    }

    if (associatePreviousData.active === false && body.active === true) {
      await Firebase.updateCount("+", DB_COLLECTION);
    }

    if (associatePreviousData.active === true && body.active === false) {
      await Firebase.updateCount("-", DB_COLLECTION);
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handlePersonalClasses = async (res, body) => {
  try {
    const db = getFirebaseAdmin().firestore();
    const id = body.id || body.docId;

    const associateRef = await db.collection(DB_COLLECTION).doc(id);

    const associateData = await associateRef.get();
    const associatePreviousData = associateData.data();

    const previousPersonalClasses = associatePreviousData.personalClasses ?? 0;

    const fieldsToUpdate = {
      personalClasses: previousPersonalClasses + body.personalClasses,
    };

    await associateRef.update(fieldsToUpdate);

    return res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handleSearch = async (res, search) => {
  try {
    const response = await getAssociateDataIndex().search(search, {
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

const handler = async (req, res) => {
  const isAuthenticated = await verifyAuth(req, res);

  if (!isAuthenticated) {
    return;
  }

  const id = req.query.id;
  if (req.method === "GET" && id !== undefined) {
    return handleFind(res, id);
  }

  const search = req.query.search;
  if (req.method === "GET" && search !== undefined) {
    return handleSearch(res, search);
  }

  const action = req.query.action;
  if (req.method === "GET" && action === "CHART_DATA") {
    return handleChartData(res);
  }

  if (req.method === "GET") {
    return handleQuery(res, req.query);
  }

  const body = JSON.parse(req.body);

  const personalClasses = body.personalClasses;
  if (req.method === "POST" && personalClasses !== undefined) {
    return handlePersonalClasses(res, body);
  }

  if (req.method === "POST") {
    return handlePost(res, body);
  }

  if (req.method === "DELETE") {
    return handleDelete(res, body);
  }

  if (req.method === "PUT") {
    return handleUpdate(req, res, body);
  }
};

export default handler;
