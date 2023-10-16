import { getFirebaseAdmin } from 'next-firebase-auth'
import initAuth from 'src/utils/auth'
import { getDateLocalized } from 'src/utils/localizedDateFns';

initAuth();

const DB_COLLECTION = "robot-log";

const handler = async (req, res) => {
  try {
    const db = getFirebaseAdmin().firestore();

    const newItemRef = db.collection(DB_COLLECTION);

    await newItemRef.add({
      savedId: req.query.savedId,
      status: req.query.status,
      createdDate: getDateLocalized(new Date(), "MM-dd-yyyy"),
      createdDateTimestamp: new Date(),
      createdAt: getDateLocalized(new Date(), 'MM-dd-yyyy HH:mm:ss'),
    });

    return res.status(200).json({ success: true });
  } catch(e) {
    console.log(e);
    return res.status(400).json({ success: false, ...e });
  }
}

export default handler
