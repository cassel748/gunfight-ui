import styles from "./Login.module.css";
import { Grid, Paper, Container } from "@material-ui/core";
import { experimentalStyled as styled } from "@material-ui/core/styles";
import {
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR,
  verifyIdToken
} from "next-firebase-auth";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import firebase from "firebase/app";
import { useSelector } from "react-redux";

const Page = dynamic(() => import("src/components/Page"), { ssr: false });

const RootStyle = styled(Page)({
  height: "100%",
});

const LoginForm = dynamic(() => import("src/components/login"), { ssr: false });

const LogoText = dynamic(() => import("src/components/LogoText"), {
  ssr: false,
});

function LoginPage() {
  function deleteAllCookies() {
    let cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        let eqPos = cookie.indexOf("=");
        let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }

  const userInfo = useSelector((state) => state.user.userInfo);
  
  const handleLogin = async () => {
    const user = firebase.auth().currentUser;

    if (user) {
      try {
        const token = userInfo.idToken;
        const tokenValid = await verifyIdToken(token);

        if (!tokenValid) {
          localStorage.clear();
          location.href = "/";
          deleteAllCookies();
        }
      } catch(e) {
        console.log(e);
        localStorage.clear();
        location.href = "/";
        deleteAllCookies();
      }

      const deletedCookies = localStorage.getItem("deleted-cookies-1");

      if (!deletedCookies) {
        deleteAllCookies();
        location.href = "/";
        localStorage.clear();
        localStorage.setItem("deleted-cookies-1", "true");
      }
    }
  };

  useEffect(async () => {
    handleLogin()
  }, []);

  return (
    <RootStyle title="GUNFIGHT" id="gunfight">
      <Grid container component="main" className={styles.root}>
        <Grid item xs={false} sm={4} md={10} className={styles.image} />
        <Grid
          item
          sm={8}
          md={4}
          xs={12}
          square
          elevation={10}
          component={Paper}
          className={styles.loginContainer}
        >
          <Container className={styles.paper}>
            <div className={styles.form}>
              <div className={styles.logoContainer}>
                <LogoText width="300" height="98" />
              </div>

              <LoginForm />
            </div>
          </Container>
        </Grid>
      </Grid>
    </RootStyle>
  );
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
})();

export default withAuthUser({ whenAuthed: AuthAction.REDIRECT_TO_APP })(
  LoginPage
);
