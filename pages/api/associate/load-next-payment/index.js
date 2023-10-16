import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth from "src/utils/auth";
import { initAlgolia, getAssociateDataIndex } from "src/utils/algolia";
import dataJson from "./data.json";

initAuth();
initAlgolia();

const DB_COLLECTION = "associate-data";

const handleQuery = async (res, query) => {
  const parseDate = query.parseDate;
  try {
    const index = await getAssociateDataIndex();
    await index.setSettings({
      paginationLimitedTo: 6000,
    });

    const found = [];
    const notFound = [];
    const firebaseSuccess = [];
    const firebaseError = [];
    const algoliaSuccess = [];
    const algoliaError = [];

    for (let i=0,n=dataJson.length; i<n; i+=1) {
      const associateData = dataJson[i];
      const name = associateData.name;

      console.log(`${i} - Searching for: `, name);

      const response = await index.search(name, {
        facetFilters: [],
        getRankingInfo: false,
        analytics: false,
        enableABTest: false,
        hitsPerPage: 10,
        attributesToRetrieve: "*",
        attributesToSnippet: "*:20",
        snippetEllipsisText: "…",
        responseFields: "*",
        explain: "*",
        page: 0,
      });
  
      const associates = response.hits;

      if (associates && associates.length) {
        console.log(`${i} - Found ${associates.length}`);
        let lastAssociate = null;
        for (let j=0,m=associates.length; j<m; j+=1) {
          const associate = associates[j];
          let duplicated = false;
          if (lastAssociate?.cpf === associate.cpf) {
            duplicated = true;
          }

          console.log(`${i} - Firebase for ${j}: `, associate.objectID);

          lastAssociate = associate;

          const dataAssociate = {...associate, duplicated};

          found.push(dataAssociate);
  
          const active = associateData.active;

          // Update firebase
          let formattedDate = associateData.nextPayment;
          
          if (parseDate) {
            const day = associateData.nextPayment.substring(0, 2);
            const month = associateData.nextPayment.substring(3, 5);
            const year = associateData.nextPayment.substring(6);

            formattedDate = `${month}-${day}-${year}`;
          }

          try {
            const db = getFirebaseAdmin().firestore();
            const associateRef = await db.collection(DB_COLLECTION).doc(associate.objectID);

            const dataToUpdate = {
              nextPayment: formattedDate
            };

            if (active !== undefined) {
              dataToUpdate.active = active;
            }
  
            await associateRef.update(dataToUpdate);
            firebaseSuccess.push(dataAssociate);
          } catch(e) {
            console.log(e);
            firebaseError.push(dataAssociate);
            console.log(`${i} - Firebase Error for: `, associate.objectID);
          } finally {
            console.log(`${i} - Finished Firebase for: `, associate.objectID);
          }

          // Update algolia
          try {
            await index.partialUpdateObject(
              {
                active,
                objectID: associate.objectID
              },
              { createIfNotExists: false }
            );
            algoliaSuccess.push(dataAssociate);
          } catch (e) {
            console.log(e);
            algoliaError.push(dataAssociate);
            console.log(`${i} - Algolia Error for: `, associate.objectID);
          } finally {
            console.log(`${i} - Finished Algolia for: `, associate.objectID);
          }
        }
      } else {
        console.log(`${i} - Not found for: `, name);
        notFound.push({ name });
        console.log(`${i} - Finished for: `, name);
      }

      console.log("\n")
    }

    return res.status(200).json({
      notFound,
      foundSize: found.length,
      notFoundSize: notFound.length,
      successCount: firebaseSuccess.length,
      errorCount: firebaseError.length,
      algoliaSuccessCount: algoliaSuccess.length,
      algoliaErrorCount: algoliaError.length,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ ...e, success: false });
  }
};

const handler = async (req, res) => {
  if (req.method === "GET") {
    return handleQuery(res, req.query);
  }
}

export default handler;
