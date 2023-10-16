import "simplebar/src/simplebar.css";
import initAuth, { firebaseConfig } from "src/utils/auth";
import firebase from "firebase/app";
import "firebase/firestore";
import { Provider } from 'react-redux';
import useMenu from "src/hooks/useMenu";
import 'react-quill/dist/quill.snow.css';
import { store } from '../src/app/store';
import dynamic from "next/dynamic";

initAuth();

const App = dynamic(
  () => import("src/app"),
  { ssr: false }
);

export default function MyApp({ Component, pageProps, menuConfig }) {
  const { setMenuData } = useMenu();
  setMenuData(menuConfig);

  return (
    <Provider store={store}>
      <App>
        <Component {...pageProps} />
      </App>
    </Provider>
  );
}

MyApp.getInitialProps = async () => {
  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.firestore();
  const snapshots = await db.collection("pages").orderBy("order").get();

  const pagesConfig = [];
  snapshots.forEach((doc) => {
    pagesConfig.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  return {
    menuConfig: pagesConfig,
  };
};
