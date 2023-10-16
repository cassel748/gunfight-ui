import algoliasearch from 'algoliasearch';

let client = null;

export const initAlgolia = () => {
  client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_PASSWORD);
}

const getIndex = indexName => {
  if (!client) {
    throw new Error("Algolia has not been initialized yet!");
  }

  return client.initIndex(indexName);
}

export const getAssociateDataIndex = () => {
  return getIndex("associate-data");
}

export const getUsersIndex = () => {
  return getIndex("user-data");
}

export const getProductsIndex = () => {
  return getIndex("internal-products");
}