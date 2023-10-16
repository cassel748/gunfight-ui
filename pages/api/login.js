import { setAuthCookies, unsetAuthCookies, getFirebaseAdmin } from 'next-firebase-auth'
import initAuth, { setUserSession } from 'src/utils/auth'
import Firebase from 'src/utils/firebase'

initAuth()

const handler = async (req, res) => {
  try {
    const user = await setAuthCookies(req, res)
    const userData = await Firebase.getDataById("user-data", user.AuthUser.id, getFirebaseAdmin().firestore());
    setUserSession({
      id: user.AuthUser.id,
      ...userData,
    });
  } catch (e) {
    if (e.code === "auth/argument-error") {
      return res.status(200).json({
        redirect: {
          destination: '/logout',
          permanent: false,
        }
      });
    }
    setUserSession(null)
    await unsetAuthCookies(req, res);
    return res.status(500).json({ error: 'Unexpected error.', e })
  }
  return res.status(200).json({ success: true })
}

export default handler
