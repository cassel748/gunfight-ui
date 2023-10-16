import { getFirebaseAdmin, unsetAuthCookies } from 'next-firebase-auth'
import initAuth from 'src/utils/auth'
import Firebase from 'src/utils/firebase';
import { urlToPageId } from 'src/utils/url';

initAuth();

const DB_COLLECTION = "user-data";

const handler = async (req, res) => {
  try {
    const db = getFirebaseAdmin().firestore();
    const uid = req.headers.authorization
    const pageId = urlToPageId(req.headers.page);

    const userData = await Firebase.getDataById(DB_COLLECTION, uid, db);

    // Super user has super powers :)
    if (userData.accessLevel === 99) {
      return res.status(200).json(userData);
    }

    if (userData && userData.active === false) {
      await unsetAuthCookies(req, res);

      return res.status(200).json({
        redirect: {
          destination: '/user-disabled',
          permanent: false,
        }
      });
    }

    const pages = await Firebase.query('pages', null, db);

    let page = pages.find(item => item && item.id && item.id.includes(pageId) && !item.subheader && item.requiredAccessLevel !== undefined);

    if (!page) {
      page = pages.find(item => pageId && pageId.includes(item.id) && !item.subheader && item.requiredAccessLevel !== undefined);
    }

    if (page && userData && userData.accessLevel < page.requiredAccessLevel || page.active === false) {
      return res.status(200).json({
        redirect: {
          destination: '/403',
          permanent: false,
        }
      });
    }

    return res.status(200).json(userData)
  } catch (e) {
    if (e.code === "auth/argument-error") {
      return res.status(200).json({
        redirect: {
          destination: '/',
          permanent: false,
        }
      });
    }
    return res.status(500).json({
      redirect: {
        destination: '/500',
        permanent: false,
      }
    })
  }
}

export default handler
