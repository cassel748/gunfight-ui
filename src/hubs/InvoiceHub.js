import DefaultHub from "./DefaultHub";

const DB_COLLECTION = "invoices";
const DB_COLLECTION_ITEMS = "invoice-items";

export default class InvoiceHub extends DefaultHub {
  getInvoices = async (filter) => {
    const dbCollection = await this.query(DB_COLLECTION, {
      where: [
        { field: "createdDateTimestamp", op: ">=", value: new Date(filter.initialDate) },
        { field: "createdDateTimestamp", op: "<=", value: new Date(filter.endDate) },
      ]
    });

    const invoices = [];
    let snapshots = await dbCollection.get();
    snapshots.forEach((doc) => {
      invoices.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return invoices;
  }

  getInvoiceItems = async (filter) => {
    if (!filter.invoiceId) {
      throw new Error("Invoice ID should be passed");
    }

    const dbCollectionItems = await this.query(DB_COLLECTION_ITEMS, {
      where: [
        { field: "invoiceId", op: "==", value: filter.invoiceId },
        { field: "sellerId", op: "==", value: filter.sellerId },
        { field: "productType", op: "==", value: filter.productType },
        { field: "productId", op: "==", value: filter.productId },
        { field: "status", op: "!=", value: "D" },
      ],
      orderBy: {
        field: "status", order: "asc"
      },
    });

    const snapshots = await dbCollectionItems.get();
    return snapshots;
  }

  getInvoiceItemsMultipleProducts = async (filter) => {
    if (!filter.invoiceId) {
      throw new Error("Invoice ID should be passed");
    }

    const dbCollectionItems = await this.query(DB_COLLECTION_ITEMS, {
      where: [
        { field: "invoiceId", op: "==", value: filter.invoiceId },
        { field: "sellerId", op: "==", value: filter.sellerId },
        { field: "productType", op: "==", value: filter.productType },
        { field: "productId", op: "in", value: filter.productId },
        { field: "status", op: "!=", value: "D" },
      ],
      orderBy: {
        field: "status", order: "asc"
      },
    });

    const snapshots = await dbCollectionItems.get();
    return snapshots;
  }


  /*getInvoicesBulk = async (filter) => {
    const invoices = [];

    // aqui pegamos os dias do mes e dividimos em arrays de 10 itens
    const datesBulk = this.buildDateRangeWhere(filter.initialDate, filter.endDate);

    // aqui fizemos uma query para cada 10 dias pois o "IN" do firestore só aceita 10
    // como temos 31 dias só ta tranquilo, no maximo faremos 4 consultas
    for (let i = 0, n = datesBulk.length; i < n; i += 1) {
      const datesArray = datesBulk[i];

      // uma consulta para cada 10 itens
      const db = getFirebaseAdmin().firestore();
      let invoiceDbQuery = db.collection(DB_COLLECTION);
      invoiceDbQuery = invoiceDbQuery.where("createdDate", "in", datesArray);

      let snapshots = await invoiceDbQuery.get();

      snapshots.forEach((doc) => {
        // junta as 4 consultas e monta a lista de invoice
        invoices.push({
          id: doc.id,
          ...doc.data(),
        });
      });
    }

    return invoices;
  }*/
}
