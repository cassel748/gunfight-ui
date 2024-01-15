import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { verifyAuth } from "src/utils/auth";
import { FINANCIAL_OPERATION_ENUM, MUST_CONTAIN_CALIBER_NUMBER } from "src/utils/enums";
import { addYears, getDateLocalized } from "src/utils/localizedDateFns";

initAuth();

const DB_COLLECTION = "invoices";
const DB_COLLECTION_ITEMS = "invoice-items";
const DB_COLLECTION_ASSOCIATE_EVENTS = "associate-events";

let personalQuantity = 10;
const handleQuery = async (res, query) => {
  try {
    const status =
      query.status === "open" ? "open" : parseInt(query.status, 10);
    const createdDate = query.createdDate ? query.createdDate : null;
    const invoiceId = query.invoiceId ? query.invoiceId : null;

    const db = getFirebaseAdmin().firestore();
    let dbQuery = db.collection(DB_COLLECTION);

    if (status === "open") {
      dbQuery = dbQuery.where("status", "in", [1, 2, 3]);
    } else {
      dbQuery = dbQuery.where("status", "==", status);
    }

    if (createdDate) {
      dbQuery = dbQuery.where("createdDate", "==", createdDate);
    }

    if (invoiceId) {
      dbQuery = dbQuery.where("invoiceId", "==", invoiceId);
    }

    const snapshots = await dbQuery.get();

    const invoices = [];
    snapshots.forEach((doc) => {
      invoices.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json(invoices);
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

const handleOpen = async (res, query) => {
  try {
    const action = query.action;

    const db = getFirebaseAdmin().firestore();
    let dbQuery = db
      .collection(DB_COLLECTION)
      .where("invoiceId", "==", query.invoiceId);

    if (action === "OPEN") {
      // exclude paid invoices
      dbQuery = dbQuery.where("status", "!=", 3);
    }

    dbQuery = dbQuery.limit(10);

    const snapshots = await dbQuery.get();

    const invoices = [];
    snapshots.forEach((doc) => {
      invoices.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json(invoices);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handleFinish = async (res, body) => {
  try {
    const db = getFirebaseAdmin().firestore();
    let dbQuery = db.collection(DB_COLLECTION).doc(body.docId);

    const response = await dbQuery.get();
    const invoice = response.data();

    /*     if (invoice && invoice.status === 1) {
      return res.status(200).json({ success: false, message: "Somente comandas finalizadas podem ser pagas."});
    } */

    if (invoice && invoice.status === 3) {
      return res
        .status(200)
        .json({ success: false, message: "Comanda já está paga." });
    }

    const invoiceItemsQuery = await db
      .collection(DB_COLLECTION_ITEMS)
      .where("invoiceId", "==", body.docId)
      .get();

    let invoiceItemsData = [];
    invoiceItemsQuery.forEach((item) => {
      invoiceItemsData.push({
        itemId: item.id,
        ...item.data(),
      });
    });

    const PROCEDURES = {
      // annuityTwo: {
      //   ids: ['QFwqvM6hRYjyGCEY1Cxk'],
      //   dispatch: annuityProcedureTwoYears
      // },
      annuity: {
        ids: ["p0Kp2MqhIek1Yp8oEjw0", "scOszqyiiZ8hDDrlRw0M"],
        dispatch: annuityProcedure,
      },
      personalPackages: {
        ids: ["8WL38RNYEjSbEOE6UCPm"],
        dispatch: personalPackageProcedure,
      },
    };

    for (let procedureKey in PROCEDURES) {
      const procedure = PROCEDURES[procedureKey];
      let itemsList = invoiceItemsData.filter(
        (item) => procedure.ids.indexOf(item.productId) > -1
      );
      if (itemsList && itemsList?.length) {
        procedure.dispatch(db, invoice, itemsList, body);
      }
    }

    // Pega todos produtos da comanda que possam incluir municao
    let dbQueryItems = db
      .collection(DB_COLLECTION_ITEMS)
      .where("invoiceId", "==", body.docId)
      .where("productType", "in", MUST_CONTAIN_CALIBER_NUMBER)
      .where("status", "!=", "D");

    const invoiceItems = await dbQueryItems.get();

    if (invoiceItems && invoiceItems.size) {
      let dbQueryEvents = db.collection(DB_COLLECTION_ASSOCIATE_EVENTS);

      const responseEvents = await dbQueryEvents
        .where("type", "==", 99)
        .where("associateId", "==", invoice.associateId)
        .where("createdDate", "==", getDateLocalized(new Date(), "MM-dd-yyyy"))
        .get();


      // Delete habituality to ensure reopen/finish will update habituality based on products
      if (responseEvents && responseEvents.size > 0) {
        const event = responseEvents.docs[0];

        await db
          .collection(DB_COLLECTION_ITEMS)
          .doc(event.id)
          .delete();
      }

      const products = [];
      invoiceItems.forEach((item) => {
        products.push({
          itemId: item.id,
          ...item.data(),
        });
      });

      const event = {
        status: "A",
        name: "Habitualidade",
        type: 99,
        associateId: invoice.associateId,
        products,
        createdBy: body.finishedBy,
        createdAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
        createdDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
        createdDateTimestamp: new Date(),
      };
      await dbQueryEvents.add(event);
    }

    //CONTADOR AULAS PERSONAL
    const personalClasses = await db
      .collection(DB_COLLECTION_ITEMS)
      .where("invoiceId", "==", body.docId)
      .where("productId", "in", [
        "b7f34P6M2IRs4vRxQsZ6",
        "0vzAO6KfO3DDpWYNZtVP",
      ])
      .get();

    let personalClassesSum = 0;
    personalClasses.forEach((item) => {
      personalClassesSum += item.data().quantity;
    });

    const associateQuery = await db
      .collection("associate-data")
      .doc(invoice.associateId);

    const associate = await associateQuery.get();
    const associateData = await associate.data();

    let personalClassesRemoved = 0;
    const associatePersonalClasses = associateData.personalClasses ?? 0;
    if (associatePersonalClasses > 0 && personalClassesSum > 0) {
      let pClassesUpdated = associatePersonalClasses - personalClassesSum;

      if (pClassesUpdated >= 0) {
        personalClassesRemoved = personalClassesSum;
      } else {
        pClassesUpdated = 0;
        personalClassesRemoved = associatePersonalClasses;
      }

      associateQuery.update({
        personalClasses: pClassesUpdated,
      });
    }

    const paymentDiscount = body.paymentDiscount || 0;
    const paymentForm = body.paymentForm;

    let total = invoice.total - paymentDiscount;

    const payload = {
      paymentDiscount: parseFloat(paymentDiscount),
      paymentForm,
      subtotal: invoice.total + invoice.discount,
      observation: body.observation || "",
      personalClasses: personalClassesRemoved,
      finishedBy: body.finishedBy,
      finishedAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
      finishedDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
      total: parseFloat(total.toFixed(2)),
      status: 3,
    };

    await dbQuery.update(payload);

    return res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const annuityProcedure = async (db, invoice, items, body) => {
  const associateQuery = await db
    .collection("associate-data")
    .doc(invoice.associateId);

  const associate = await associateQuery.get();
  const associateData = await associate.data();

  let nextPayment = new Date(
    associateData.nextPayment || getDateLocalized(new Date(), "MM-dd-yyyy")
  );
  let annuityQuantity = 0;
  items.forEach((item) => {
    annuityQuantity += item.quantity;
  });

  associateQuery.update({
    nextPayment: getDateLocalized(
      addYears(nextPayment, annuityQuantity),
      "MM-dd-yyyy"
    ),
  });
  personalQuantity = 1;
  personalPackageProcedure(db, invoice, items, body);
};

const personalPackageProcedure = async (db, invoice, items, body) => {
  try {
    const productQuery = db
      .collection("internal-products")
      .doc("0vzAO6KfO3DDpWYNZtVP");
    const productSnapshot = await productQuery.get();
    const personalClassProduct = productSnapshot.data();
    personalClassProduct.price = 0;

    const walletQuery = db.collection("associate-wallet");

    const personalClassesQuantity =
      items.map((item) => item.quantity).reduce((a, b) => a + b) *
      personalQuantity;

    const item = {
      status: "A",
      associateId: invoice.associateId,
      value: 0,
      type: FINANCIAL_OPERATION_ENUM.PRODUCT,
      date: getDateLocalized(new Date(), "MM-dd-yyyy hh:mm:ss"),
      description: personalClassProduct.title,
      quantity: personalClassesQuantity,
      discount: 0,
      subtotal: 0,
      product: personalClassProduct,
      availableQuantity: personalClassesQuantity,
      createdBy: body.finishedBy,
      createdAt: getDateLocalized(new Date(), "MM-dd-yyyy hh:mm:ss"),
      createdDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
      createdDateTimestamp: new Date(),
    };

    await walletQuery.add(item);

    const associateRef = await db
      .collection("associate-data")
      .doc(invoice.associateId);
    const associateData = await associateRef.get();
    const associatePreviousData = associateData.data();

    const previousPersonalClasses =
      associatePreviousData.personalClasses &&
      !isNaN(associatePreviousData.personalClasses)
        ? associatePreviousData.personalClasses
        : 0;

    const fieldsToUpdate = {
      personalClasses: previousPersonalClasses + personalClassesQuantity,
    };

    await associateRef.update(fieldsToUpdate);
  } catch (err) {
    console.log(err);
  }
};

const handlePost = async (res, body) => {
  try {
    const db = getFirebaseAdmin().firestore();

    const dbQuery = db.collection(DB_COLLECTION);
    const snapshots = await dbQuery
      .where("invoiceId", "==", body.invoiceId)
      .where("status", "in", [1, 2])
      .get();
    const billsSnapshots = await dbQuery
      .where("associateNumber", "==", body.associateNumber)
      .where("status", "in", [1, 2])
      .get();

    const todaySnapshots = await dbQuery
      .where("invoiceId", "==", body.invoiceId)
      .where("createdDate", "==", getDateLocalized(new Date(), "MM-dd-yyyy"))
      .get();

    const invoices = [];
    snapshots.forEach((doc) => {
      invoices.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    const bills = [];
    billsSnapshots.forEach((doc) => {
      bills.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    const todayBills = [];
    todaySnapshots.forEach((doc) => {
      todayBills.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    if (invoices && invoices?.length) {
      return res.status(200).json({
        message: `A Comanda ${body.invoiceId} já está aberta ou pendente de pagamento`,
        success: false,
      });
    } else if (bills && bills?.length) {
      return res.status(200).json({
        message: `O usuário ${
          body.associateName
        } já possui uma comanda aberta ou pendente de pagamento no dia ${getDateLocalized(
          new Date(bills[0].createdAt),
          "dd/MM/yyyy"
        )}!`,
        success: false,
      });
    } else if (todayBills && todayBills?.length) {
      return res.status(200).json({
        message: `A Comanda ${body.invoiceId} já foi aberta hoje!`,
        success: false,
      });
    }

    const response = await dbQuery.add({
      status: 1,
      associateId: body.associateId,
      associateName: body.associateName,
      associateNumber: body.associateNumber,
      associateCrNumber: body.associateCrNumber,
      internalUserType: body.internalUserType,
      nextPayment: body.nextPayment,
      invoiceId: body.invoiceId,
      sellerId: body.sellerId,
      sellerName: body.sellerName,
      total: body.total,
      discount: body.discount || 0,
      paymentDiscount: 0,
      createdDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
      createdDateTimestamp: new Date(),
      createdBy: body.createdBy,
      createdAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
    });

    return res
      .status(200)
      .json({ success: true, createdInvoiceId: response.id });
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

    const response = await db.collection(DB_COLLECTION).doc(docId).get();

    if (response.status === 3 && body.status !== response.status) {
      return res.status(200).json({
        success: false,
        message: "Você não pode alterar o status de uma comanda Paga(3)",
      });
    }

    const invoiceData = response.data();
    if (invoiceData.personalClasses && invoiceData.personalClasses > 0) {
      const associateQuery = await db
        .collection("associate-data")
        .doc(body.associateId);

      const associate = await associateQuery.get();
      const associateData = await associate.data();

      const personalClasses = associateData.personalClasses ?? 0;
      associateQuery.update({
        personalClasses: personalClasses + invoiceData.personalClasses,
      });
    }

    const payload = {
      status: body.status,
      associateId: body.associateId,
      associateName: body.associateName,
      associateNumber: body.associateNumber,
      associateCrNumber: body.associateCrNumber || "",
      internalUserType: body.internalUserType || "",
      invoiceId: body.invoiceId,
      sellerId: body.sellerId,
      sellerName: body.sellerName,
      total: body.total,
      discount: body.discount || 0,
      personalClasses: 0,
      modifiedBy: body.modifiedBy,
      modifiedAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
      modifiedDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
    };

    if (body.status === 3) {
      payload.finishedDate = getDateLocalized(new Date(), "MM-dd-yyyy");
      payload.finishedBy = body.modifiedBy;
    }

    await db.collection(DB_COLLECTION).doc(docId).update(payload);

    return res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handler = async (req, res) => {
  const action = req.query.action;
  if (action !== "OPEN") {
    const isAuthenticated = await verifyAuth(req, res);

    if (!isAuthenticated) {
      return;
    }
  }

  if (req.method === "GET" && action === "OPEN") {
    return handleOpen(res, req.query);
  }

  const id = req.query.id;
  if (req.method === "GET" && id !== undefined) {
    return handleFind(res, id);
  }

  if (req.method === "GET" && !action) {
    return handleQuery(res, req.query);
  }

  const body = JSON.parse(req.body);

  if (req.method === "PUT" && action === "FINISH") {
    return handleFinish(res, body);
  }

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

// const annuityProcedureTwoYears = async (db, invoice, items, body) => {
//   const associateQuery = await db
//     .collection("associate-data")
//     .doc(invoice.associateId);

//   const associate = await associateQuery.get();
//   const associateData = await associate.data();

//   let nextPayment = new Date(
//     associateData.nextPayment || getDateLocalized(new Date(), "MM-dd-yyyy")
//   );
//   let annuityQuantity = 0;
//   items.forEach((item) => {
//     annuityQuantity += item.quantity * 2;
//   });

//   associateQuery.update({
//     nextPayment: getDateLocalized(
//       addYears(nextPayment, annuityQuantity),
//       "MM-dd-yyyy"
//     ),
//   });
// };
