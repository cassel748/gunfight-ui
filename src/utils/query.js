export const generateFilterQuery = (fields) => {
  let filter = "";

  for (let key of Object.keys(fields)) {
    const value = fields[key];
    if (typeof value === "object") {
      let listFilter = "";
      for (let i=0,n=value.length; i<n; i+=1) {
        const valueOr = value[i];
        const isNotOr = valueOr.indexOf("!") > -1;
        const valueOrParsed = valueOr.replace("!", "")

        let and = "";
        if (!filter.length && isNotOr) {
          and += ` ${listFilter.indexOf("NOT") > -1 ? " AND " : ""}NOT `
        }

        listFilter += `${and}${listFilter.length ? ` ${isNotOr ? "" : " OR "} ` : ""}${key}${typeof valueOr === "number" ? " = " : ":"}${valueOrParsed}`
      }
      if (listFilter.length) {
        filter += `${filter.length ? " AND " : ""}${listFilter}`;  
      }
    }

   if (typeof value !== "object") {
    const isNot = value.indexOf("!") > -1;
    const valueParsed = value.replace("!", "")

    let and = "";
    if (filter.length && !isNot) {
      and += ` AND `
    }
    if (!filter.length && isNot) {
      and += `${filter.indexOf("NOT") > -1 ? " AND " : ""}NOT `
    }
    filter += `${and}${key}${typeof value === "number" ? " = " : ":"}${valueParsed}`
   }
  }

  filter = filter.replace(/\s\s+/g, ' ');
  filter = filter.trim();
  return filter;
}


export const getDatesBetween = (startDate, endDate) => {
  const dates = [];
  let currentDate = startDate;

  const addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  }

  while (currentDate <= endDate) {
    dates.push(currentDate);
    currentDate = addDays.call(currentDate, 1);
  }
  return dates;
}
