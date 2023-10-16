import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth from "src/utils/auth";
import { initAlgolia } from "src/utils/algolia";
import dataJson from "./data.json";

initAuth();
initAlgolia();

const DB_COLLECTION = "associate-data";

const handleQuery = async (res) => {
  try {
    const data = dataJson.filter(item => {
      return item.internalUserType === undefined || item.internalUserType === "" || item.internalUserType === null;
    });

    const notFound = [];
    const firebaseSuccess = [];
    const firebaseError = [];
    const algoliaSuccess = [];
    const algoliaError = [];

    for (let i=0,n=data.length; i<n; i+=1) {
      const associate = data[i];

      try {
        const db = getFirebaseAdmin().firestore();
        const associateRef = await db.collection(DB_COLLECTION).doc(associate.objectID);

        const dataToUpdate = {
          internalUserType: 4
        };

        await associateRef.update(dataToUpdate);
        firebaseSuccess.push(associate);
      } catch(e) {
        console.log(e);
        firebaseError.push(associate);
        console.log(`${i} - Firebase Error for: `, associate.objectID);
      } finally {
        console.log(`${i} - Finished Firebase for: `, associate.objectID);
      }

      // Update algolia
      try {
        await index.partialUpdateObject(
          {
            internalUserType: 4,
            objectID: associate.objectID
          },
          { createIfNotExists: false }
        );
        algoliaSuccess.push(associate);
      } catch (e) {
        console.log(e);
        algoliaError.push(associate);
        console.log(`${i} - Algolia Error for: `, associate.objectID);
      } finally {
        console.log(`${i} - Finished Algolia for: `, associate.objectID);
      }
      
      console.log("\n")
    }

    return res.status(200).json({
      notFound,
      foundSize: data.length,
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
    return handleQuery(res);
  }
}

export default handler;
