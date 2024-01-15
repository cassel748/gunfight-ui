import {
  AuthAction,
  init,
  verifyIdToken,
  withAuthUserTokenSSR,
  getFirebaseAdmin,
} from "next-firebase-auth";
import Firebase from "./firebase";

export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

export const STORAGE_PREFIX = process.env.STORAGE_PREFIX;

export const USER_TYPE = {
  SUPER: 99,
  VALIDATOR: 98,
  ADMINISTRATOR: 4,
  MARKETING: 3,
  SELLING: 2,
  INSTRUCTOR: 1,
  NORMAL: 0,
};

export const USER_TYPE_DESCRIPTION = {
  99: "Super",
  98: "Validador",
  4: "Administrador",
  3: "Gerencial",
  2: "Comercial",
  1: "Instrutor",
  0: "Comum",
};

export const USER_TYPE_VALUE = [
  { title: "Super", value: 99 },
  { title: "Validador", value: 98 },
  { title: "Administrador", value: 4 },
  { title: "Gerencial", value: 3 },
  { title: "Comercial", value: 2 },
  { title: "Instrutor", value: 1 },
  { title: "Comum", value: 0 },
];

const initAuth = () => {
  const COOKIE_SECURE = !!(
    process.env.COOKIE_SECURE === "true" || process.env.COOKIE_SECURE === true
  );
  const COOKIE_SIGNED = !!(
    process.env.COOKIE_SIGNED === "true" || process.env.COOKIE_SIGNED === true
  );

  init({
    authPageURL: "/",
    appPageURL: "/actions/invoices",
    loginAPIEndpoint: "/api/login",
    logoutAPIEndpoint: "/api/logout",
    firebaseAdminInitConfig: {
      credential: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      },
    },
    firebaseClientInitConfig: firebaseConfig,
    cookies: {
      name: process.env.COOKIE_NAME,
      keys: [
        process.env.COOKIE_SECRET_CURRENT,
        process.env.COOKIE_SECRET_PREVIOUS,
      ],
      httpOnly: false,
      maxAge: 7 * 60 * 60 * 24 * 1000, // seven days
      overwrite: true,
      path: "/",
      sameSite: "strict",
      secure: COOKIE_SECURE,
      signed: COOKIE_SIGNED,
    },
    onVerifyTokenError: (err) => {
      console.error("onVerifyTokenError", err);
    },
    onTokenRefreshError: (err) => {
      console.error("onTokenRefreshError", err);
    },
    onLoginRequestError: (err) => {
      console.error("onLoginRequestError", err);
    },
    onLogoutRequestError: (err) => {
      console.error("onLogoutRequestError", err);
    },
  });
};

export default initAuth;

export const getAbsoluteUrl = (url) => {
  const absoluteUrl = process.env.NEXT_ABSOLUTE_URL;
  return `${absoluteUrl}${url}`;
};

export const withAuthLevel = (callback) =>
  withAuthUserTokenSSR({
    whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
  })(async (req) => {
    const idToken = await req.AuthUser.getIdToken();
    const id = req.AuthUser.id;
    const userData = await Firebase.getDataById(
      "user-data",
      id,
      getFirebaseAdmin().firestore()
    );
    setUserSession({
      id,
      ...userData,
    });

    const response = await fetch(getAbsoluteUrl("/api/session"), {
      method: "GET",
      headers: {
        Authorization: id,
        Page: req.resolvedUrl,
      },
    });
    const data = await response.json();

    if (callback) {
      return callback(req, data, idToken);
    }

    return data;
  });

export const generateId = (length = 20) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const verifyAuth = async (req, res) => {
  if (!(req.headers && req.headers.authorization)) {
    return res
      .status(400)
      .json({ error: "Missing Authorization header value" });
  }

  if (req.headers && req.headers.authorization === "robot") {
    return true;
  }

  const token = req.headers.authorization;

  try {
    await verifyIdToken(token);
    return true;
  } catch (e) {
    console.error(e);
    return res.status(403).json({ error: "Not authorized" });
  }
};

let actualUserSession = null;
export const setUserSession = (session) => {
  actualUserSession = session;
};
export const getUserSession = () => {
  return actualUserSession;
};
