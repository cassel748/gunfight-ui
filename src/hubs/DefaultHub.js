import { getFirebaseAdmin } from "next-firebase-auth";
import { sliceIntoChunks } from "src/utils/array";
import { getDateLocalized } from "src/utils/localizedDateFns";
import { getDatesBetween } from "src/utils/query";

const db = getFirebaseAdmin().firestore();

export default class DefaultHub {
  collection = null;

  query = async (collection, config) => {
    this.collection = await db.collection(collection);

    const where = config.where;
    const orderBy = config.orderBy;

    if (where && where.length) {
      for (let i = 0, n=where.length; i<n; i+=1) {
        const clause = where[i];

        if (clause.value !== undefined && clause.value !== "" && clause.value !== null) {
          this.collection = await this.collection.where(clause.field, clause.op, clause.value);
        }
      }
    }

    if (orderBy) {
      this.collection = this.collection.orderBy(orderBy.field, orderBy.order);
    }

    return this.collection;
  }

  buildDateRangeWhere = (startDate, endDate) => {
    const dates = getDatesBetween(new Date(startDate), new Date(endDate));
    const formattedDates = [];
    for (let i = 0, n = dates.length; i < n; i += 1) {
      const date = getDateLocalized(dates[i], "MM-dd-yyyy");
      formattedDates.push(date);
    }

    const sliced = sliceIntoChunks(formattedDates, 10);
    return sliced;
  }

  buildWhere = (dbCollection, fieldList) => {
    for (let i = 0, n = fieldList.length; i < n; i += 1) {
      const item = fieldList[i];

      const field = item[0];
      const comparator = item[1];
      const value = item[2];

      if (value !== undefined && value !== "" && value !== null) {
        dbCollection = dbCollection.where(field, comparator, value);
      }
    }
    return dbCollection;
  }
}
