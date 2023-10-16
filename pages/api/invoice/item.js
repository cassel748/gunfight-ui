import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth, { verifyAuth } from "src/utils/auth";
import { getDateLocalized } from "src/utils/localizedDateFns";

initAuth();

const DB_COLLECTION = "invoice-items";
const DB_COLLECTION_INVOICES = "invoices";
const DB_COLLECTION_PRODUCTS = "internal-products";
const DB_COLLECTION_NOTIFICATIONS = "notifications";
const DB_COLLECTION_WALLET = "associate-wallet";

const handleQuery = async (res, query) => {
  try {
    const db = getFirebaseAdmin().firestore();
    let dbQuery = db.collection(DB_COLLECTION);

    const snapshots = await dbQuery.get();

    const invoiceItems = [];
    snapshots.forEach((doc) => {
      invoiceItems.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json(invoiceItems);
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

const handlePost = async (res, body) => {
  try {
    const db = getFirebaseAdmin().firestore();

    const invoiceId = body.invoiceId;
    const invoiceQuery = db.collection(DB_COLLECTION_INVOICES).doc(invoiceId);
    const invoice = await invoiceQuery.get();

    const invoiceData = {
      docId: invoice.id,
      ...invoice.data(),
    };

    if (invoiceData && (invoiceData.status === 2 || invoiceData.status === 3)) {
      return res.status(200).json({
        message: `Somente comandas em aberto podem receber itens.`,
        success: false,
      });
    }

    const productQuery = db
      .collection(DB_COLLECTION_PRODUCTS)
      .doc(body.productId);
    const responseProduct = await productQuery.get();
    const product = responseProduct.data();

    if (
      product.inventoryQuantity &&
      product.inventoryQuantity < body.quantity
    ) {
      return res.status(200).json({
        message: `Este produto só possui ${product.inventoryQuantity} itens em estoque.`,
        success: false,
      });
    }

    const dbQuery = db.collection(DB_COLLECTION);

    const failCount = body.failCount;
    const applyDiscount = body.applyDiscount;
    const subtotalItem = body.quantity * body.productPrice;
    const discountValue = applyDiscount ? body.productPrice * failCount : 0;
    const itemDiscount = body.itemDiscount;
    let itemTotal = body.productPrice * body.quantity - body.itemDiscount;

    if (applyDiscount) {
      itemTotal = itemTotal - discountValue;
    }

    const payload = {
      status: "A",
      invoiceId: body.invoiceId,
      sellerId: body.sellerId,
      sellerName: body.sellerName,
      subtotal: subtotalItem,
      productTitle: body.productTitle,
      productType: body.productType,
      productPrice: body.productPrice,
      productId: body.productId,
      weaponOrigin: body.weaponOrigin,
      weaponId: body.weaponId || "",
      quantity: body.quantity,
      createdBy: body.createdBy,
      failCount,
      gunDetail: body.gunDetail || "",
      modelWeapon: body.modelWeapon,
      serialNumber: body.serialNumber,
      transferOf: body.transferOf,
      transferTo: body.transferTo,
      applyDiscount,
      itemTotal,
      createdDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
      createdDateTimestamp: new Date(),
      createdAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
    };

    // check discount and increase variable for future invoice update
    if (applyDiscount) {
      payload.discountApplied = discountValue;
    }

    // check discount for item and increase variable for future invoice update
    if (itemDiscount) {
      payload.itemDiscount = itemDiscount;
    }

    const response = await dbQuery.add(payload);

    // update invoice total
    let total = invoiceData.total + subtotalItem;

    if (itemDiscount) {
      total = total - itemDiscount;
    }

    let alcoholWarningQuery = await dbQuery
      .where("invoiceId", "==", body.invoiceId)
      .where("productId", "in", [
        "ZCRZFh0eVCIay3NsRTIt",
        "h8Ztpg9TEFNg4NhIQk0u",
        "jcNFxROLaqiVcQbVGOhA",
        "MzoKtqDzKf5qWf4L3qta",
        "u8ceAONL9h0Tv0RySkab",
        "rARjmrnnmbu8P7znlefS",
        "QMgsZeaf1uLhyYhp6RyW",
      ])
      .get();
    let alcoholWarning = alcoholWarningQuery && alcoholWarningQuery.size > 0;

    await invoiceQuery.update({
      total,
      discount: invoiceData.discount + discountValue,
      itemDiscount,
      alcoholWarning,
    });

    // update product inventory
    if (product.inventoryQuantity) {
      const newInventoryQuantity = product.inventoryQuantity - body.quantity;

      await productQuery.update({
        inventoryQuantity: newInventoryQuantity,
      });

      if (newInventoryQuantity <= product.minimumInventoryQuantity) {
        const notificationsQuery = db.collection(DB_COLLECTION_NOTIFICATIONS);

        await notificationsQuery.add({
          status: "UNREAD",
          createdAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
          createdDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
          createdDateTimestamp: new Date(),
          message: `O produto ${product.title}(${responseProduct.id}) atingiu o estoque minimo!`,
          type: "warning",
        });
      }
    }

    return res.status(200).json({ success: true, createdItemId: response.id });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handlePostInventory = async (res, body) => {
  try {
    const db = getFirebaseAdmin().firestore();

    const invoiceId = body.invoiceId;
    const invoiceQuery = db.collection(DB_COLLECTION_INVOICES).doc(invoiceId);
    const invoice = await invoiceQuery.get();

    const invoiceData = {
      docId: invoice.id,
      ...invoice.data(),
    };

    if (invoiceData && (invoiceData.status === 2 || invoiceData.status === 3)) {
      return res.status(200).json({
        message: `Somente comandas em aberto podem receber itens.`,
        success: false,
      });
    }

    const dbQuery = db.collection(DB_COLLECTION);

    const failCount = body.failCount;
    const applyDiscount = body.applyDiscount;
    const subtotalItem = 0;
    const itemTotal = 0;

    const payload = {
      status: "A",
      invoiceId: body.invoiceId,
      sellerId: body.sellerId,
      sellerName: body.sellerName,
      subtotal: subtotalItem,
      productTitle: body.productTitle,
      productType: body.productType,
      productPrice: body.productPrice,
      productId: body.productId,
      weaponOrigin: "",
      weaponId: "",
      quantity: body.quantity,
      createdBy: body.createdBy,
      failCount,
      gunDetail: body.gunDetail || "",

      applyDiscount,
      itemTotal,
      fromInventory: true,
      createdDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
      createdDateTimestamp: new Date(),
      createdAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
    };

    const response = await dbQuery.add(payload);

    // UPDATE INVENTORY QUANTITY
    const walletQuery = db.collection(DB_COLLECTION_WALLET).doc(body.productId);
    const walletItem = await walletQuery.get();
    const wallet = walletItem.data();

    await walletQuery.update({
      availableQuantity: wallet.availableQuantity - body.quantity,
    });

    return res.status(200).json({ success: true, createdItemId: response.id });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handleDelete = async (res, body) => {
  try {
    const db = getFirebaseAdmin().firestore();
    const docId = body.docId;

    const invoiceId = body.invoiceId;
    const invoiceQuery = db.collection(DB_COLLECTION_INVOICES).doc(invoiceId);
    const invoice = await invoiceQuery.get();

    const invoiceData = {
      docId: invoice.id,
      ...invoice.data(),
    };

    const dbQuery = await db.collection(DB_COLLECTION).doc(docId);

    const response = await dbQuery.get();
    const itemData = response.data();

    dbQuery.update({
      status: "D",
      deletedBy: body.deletedBy,
      deletedAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
      deletedDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
    });

    // update invoice total
    let total =
      invoiceData.total -
      itemData.subtotal +
      (itemData.itemDiscount ? parseFloat(itemData.itemDiscount) : 0);
    let discount = invoiceData.discount - (itemData.discountApplied || 0);

    if (total < 0) {
      total = 0;
    }

    if (discount < 0) {
      discount = 0;
    }

    await invoiceQuery.update({
      total,
      discount,
    });

    // update product inventory
    const productQuery = db
      .collection(DB_COLLECTION_PRODUCTS)
      .doc(itemData.productId);
    const responseProduct = await productQuery.get();
    const product = responseProduct.data();

    if (product.inventoryQuantity) {
      const newInventoryQuantity =
        product.inventoryQuantity + itemData.quantity;

      await productQuery.update({
        inventoryQuantity: newInventoryQuantity,
      });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handleDeleteInventory = async (res, body) => {
  try {
    const db = getFirebaseAdmin().firestore();
    const dbQuery = await db.collection(DB_COLLECTION).doc(body.docId);

    await dbQuery.update({
      status: "D",
      deletedBy: body.deletedBy,
      deletedAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
      deletedDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
    });

    // UPDATE INVENTORY QUANTITY
    const walletQuery = await db
      .collection(DB_COLLECTION_WALLET)
      .doc(body.productId);
    const walletItem = await walletQuery.get();
    const wallet = walletItem.data();

    await walletQuery.update({
      availableQuantity: wallet.availableQuantity + body.quantity,
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

    const itemQuery = db.collection(DB_COLLECTION).doc(docId);
    const itemResponse = await itemQuery.get();
    const itemPreviousData = itemResponse.data();

    const invoiceId = body.invoiceId;
    const invoiceQuery = db.collection(DB_COLLECTION_INVOICES).doc(invoiceId);
    const invoiceResponse = await invoiceQuery.get();
    const invoiceItemData = invoiceResponse.data();

    if (
      invoiceItemData.status === 2 &&
      body.status !== invoiceItemData.status
    ) {
      return res.status(200).json({
        success: false,
        message:
          "Você não pode alterar itens de uma comanda com o status Finalizada(2)",
      });
    }

    if (
      invoiceItemData.status === 3 &&
      body.status !== invoiceItemData.status
    ) {
      return res.status(200).json({
        success: false,
        message:
          "Você não pode alterar itens de uma comanda com o status Paga(3)",
      });
    }

    const failCount = body.failCount;
    const applyDiscount = body.applyDiscount;
    const subtotalItem = body.quantity * body.productPrice;
    const discountValue = applyDiscount ? body.productPrice * failCount : 0;
    const itemDiscount = body.itemDiscount;
    let itemTotal = body.productPrice * body.quantity - body.itemDiscount;

    if (applyDiscount) {
      itemTotal = itemTotal - discountValue;
    }

    const payload = {
      quantity: body.quantity,
      subtotal: subtotalItem,
      productPrice: body.productPrice,
      failCount: body.failCount,
      applyDiscount: body.applyDiscount,
      itemDiscount: itemDiscount,
      modifiedBy: body.modifiedBy,
      itemTotal,
      modifiedAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
      modifiedDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
    };

    await itemQuery.update(payload);

    // pick all items again to update invoice total
    // update invoice total
    let total = invoiceItemData.total - itemPreviousData.itemTotal + itemTotal;

    await invoiceQuery.update({
      total,
      discount: invoiceItemData.discount + discountValue,
      itemDiscount,
    });

    return res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handleAmmoFail = async (res, body) => {
  try {
    const db = getFirebaseAdmin().firestore();
    const invoiceId = body.invoiceId;
    const modifiedBy = body.modifiedBy;
    const items = body.items || [];
    let discount = 0;

    for (let i = 0, n = items.length; i < n; i++) {
      const item = items[i];
      const failCount = item.failCount;
      const applyDiscount = item.applyDiscount;

      const docId = item.docId;
      const invoiceItemQuery = db.collection(DB_COLLECTION).doc(docId);

      const discountValue = item.productPrice * failCount;
      const payload = {
        failCount,
        applyDiscount,
        modifiedBy,
        modifiedAt: getDateLocalized(new Date(), "MM-dd-yyyy HH:mm:ss"),
        modifiedDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
      };

      // check discount and increase variable for future invoice update
      if (applyDiscount) {
        discount += discountValue;
        payload.discountApplied = discountValue;
      }

      // update item data
      await invoiceItemQuery.update(payload);
    }

    // updata discount property over invoice object
    const invoiceQuery = db.collection(DB_COLLECTION_INVOICES).doc(invoiceId);

    await invoiceQuery.update({
      discount,
      modifiedBy,
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
  const action = req.query.action;
  if (req.method === "GET" && id !== undefined) {
    return handleFind(res, id);
  }

  if (req.method === "GET") {
    return handleQuery(res, req.query);
  }

  const body = typeof req.body === "object" ? req.body : JSON.parse(req.body);

  if (req.method === "POST" && action === "ADD_FROM_INVENTORY") {
    return handlePostInventory(res, body);
  }

  if (req.method === "POST") {
    return handlePost(res, body);
  }

  if (req.method === "DELETE" && action === "DELETE_FROM_INVENTORY") {
    return handleDeleteInventory(res, body);
  }

  if (req.method === "DELETE") {
    return handleDelete(res, body);
  }

  if (req.method === "PUT" && action === "AMMO_FAIL") {
    return handleAmmoFail(res, body);
  }

  if (req.method === "PUT") {
    return handleUpdate(res, body);
  }
};

export default handler;
