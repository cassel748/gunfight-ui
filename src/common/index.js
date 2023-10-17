import Head from "next/head";
import ThemeConfig from "src/theme";
import { ptBR } from "date-fns/locale";
import Settings from "src/components/settings";
import RtlLayout from "src/components/RtlLayout";
import TopProgressBar from "src/components/TopProgressBar";
import AdapterDateFns from "@material-ui/lab/AdapterDateFns";
import { SettingsProvider } from "src/contexts/SettingsContext";
import ThemePrimaryColor from "src/components/ThemePrimaryColor";
import LocalizationProvider from "@material-ui/lab/LocalizationProvider";
import { MenuProvider } from "src/contexts/MenuContext";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import Firebase from "src/utils/firebase";
import { useDispatch } from "react-redux";
import { setUser } from "src/features/user/userSlice";
import firebase from "firebase/app";
import dynamic from "next/dynamic";
import Toast from "src/utils/toast";
import { useRouter } from "next/router";
import { dispatchEvent } from "src/utils/events";
import { ErrorBoundary } from "react-error-boundary";
import { CircularProgress } from "@material-ui/core";
import ErrorTemplate from "./error";

const BarcodeReader = dynamic(() => import("react-barcode-reader"), {
  ssr: false,
});

const App = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  let idToken = null;

  const handleInit = async () => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }

    const handleUser = async (user) => {
      if (user) {
        const uid = user.uid;
        const data = await Firebase.getDataById("user-data", uid);

        idToken = await user.getIdToken(true);

        const authUser = {
          id: uid,
          email: user.email,
          idToken,
          ...data,
        };

        dispatch(setUser(authUser));
      } else {
        dispatch(setUser(null));
      }
    };

    firebase.auth().onAuthStateChanged(handleUser);
    firebase.auth().onIdTokenChanged(handleUser);
  };

  useEffect(async () => {
    handleInit();
  }, []);

  const handleInvoice = async (data) => {
    const isNumber = !isNaN(data);
    const invoiceId = data + "";

    if (isNumber && invoiceId.length === 4) {
      const response = await fetch(
        `/api/invoice?action=OPEN&invoiceId=${invoiceId}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();

      if (data && data.length) {
        Toast.info("Comanda em aberto");

        const invoice = data[0];

        setTimeout(() => {
          router.push(`/actions/invoices/${invoice.docId}`);
        }, 300);
      }

      if (data && data.length === 0) {
        if (location.pathname !== "/actions/invoices") {
          router.replace("/actions/invoices");

          const handler = () => {
            dispatchEvent("BarcodeScanner.newScan", { invoiceId });
            router.events.off("routeChangeComplete", handler);
          };

          return router.events.on("routeChangeComplete", handler);
        }

        dispatchEvent("BarcodeScanner.newScan", { invoiceId });
      }
    }
  };

  return (
    <ErrorBoundary fallback={<ErrorTemplate />}>
      <MenuProvider>
        <SettingsProvider>
          <ThemeConfig>
            <ThemePrimaryColor>
              <LocalizationProvider dateAdapter={AdapterDateFns} locale={ptBR}>
                <RtlLayout>
                  <Settings />
                  <Head>
                    <meta
                      name="viewport"
                      content="width=device-width, initial-scale=1, shrink-to-fit=no"
                    />
                  </Head>

                  {children}

                  <TopProgressBar />

                  <Toaster position="top-center" reverseOrder={false} />
                </RtlLayout>

                <BarcodeReader onError={handleInvoice} onScan={handleInvoice} />
              </LocalizationProvider>
            </ThemePrimaryColor>
          </ThemeConfig>
        </SettingsProvider>
      </MenuProvider>
    </ErrorBoundary>
  );
};

export default App;
