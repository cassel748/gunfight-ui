import { useEffect, useState } from "react";
import Page from "src/components/Page";
import Add from "@material-ui/icons/Add";
import { LoadingButton } from "@material-ui/lab";
import DashboardLayout from "src/layouts/dashboard";
import UserList from "src/components/internal-operation/user/user-list";
import UserFilter from "src/components/internal-operation/user/user-filter";
import {
  Box,
  Stack,
  Container,
  Typography,
  Pagination,
  Avatar,
  Button,
  Card,
  Grid,
} from "@material-ui/core";
import { USER_TYPE, USER_TYPE_DESCRIPTION, withAuthLevel } from "src/utils/auth";
import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import { DialogAnimate } from "src/components/animate";
import FormNewUser from "src/components/internal-operation/user/form-new-user";
import { useRouter } from "next/router";
import Firebase from "src/utils/firebase";
import { getQueryParam } from "src/utils/url";
import { useSelector } from "react-redux";
import Label from "src/components/Label";

// ----------------------------------------------------------------------

function User() {
  const userInfo = useSelector(state => state.user.userInfo);
  const AuthUser = useAuthUser();
  const router = useRouter();
    
  const [pages, setPages] = useState(0);
  const [userList, setUserList] = useState([]);
  const [actualPage, setActualPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [actualFilter, setActualFilter] = useState(null);
  const [currentUser, setCurrentUser] = useState({});
  const [isOpenNewDialog, setIsOpenNewDialog] = useState(false);
  const [isFromMyAccount, setIsFromMyAccount] = useState(false);

  const openNewDialog = () => {
    setIsOpenNewDialog(true);
  };

  const closeNewDialog = (fromSaveOrEdit) => {
    setIsOpenNewDialog(false);

    if (fromSaveOrEdit === true) {
      performSearch(null, 1);
    }

    if (isFromMyAccount && process.browser) {
      window.history.pushState({}, document.title, window.location.pathname);
      setIsFromMyAccount(false);
    }
  };

  const performSearch = async (values, page) => {
    if (userInfo.accessLevel < USER_TYPE.ADMINISTRATOR) {
      return;
    }

    try {
      setIsLoading(true);

      let url = "/api/user";
      const queryParams = new URLSearchParams();

      queryParams.append("limit", 10);
      queryParams.append("page", page);

      if (values?.name) {
        queryParams.append("name", values.name);
      }

      if (values?.email) {
        queryParams.append("email", values.email);
      }

      if (values?.accessLevel) {
        queryParams.append("accessLevel", values.accessLevel);
      }

      const searchQuery = queryParams.toString();

      if (searchQuery) {
        url = `${url}?${searchQuery}`;
      }

      const token = await AuthUser.getIdToken();
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();
      setUserList(data.results);
      setPages(data.pagination.pages);
      setActualPage(page);
    } catch (err) {
      console.log(err);
      setUserList([]);
    }
    setIsLoading(false);
  };

  const handleIdPage = async (id) => {
    if (!isOpenNewDialog) {
      const data = await Firebase.getDataById("user-data", id);
      setCurrentUser(data);
      setIsFromMyAccount(true);
      setIsOpenNewDialog(true);
    }
  }

  useEffect(() => {
    performSearch(null, 1);

    const handleEditUser = () => {
      const handleRouteChange = () => {
        const id = getQueryParam("id");
        if (id && !isOpenNewDialog) {
          handleIdPage(id);
        }

        router.events.off('routeChangeComplete', handleRouteChange)
      };

      router.events.on('routeChangeComplete', handleRouteChange)
    };

    const id = getQueryParam("id");

    if (id) {
      handleIdPage(id);
    }

    document.addEventListener("Navigation.editUser", handleEditUser);

    return () => {
      document.removeEventListener("Navigation.editUser", handleEditUser);
    };
  }, []);

  const handlePageChange = (event, value) => {
    performSearch(actualFilter, value);
    setActualPage(value);
  };

  const onFilter = (values) => {
    setActualFilter(values);
    if (!values) {
      return performSearch(values, 1);
    }

    performSearch(values, actualPage);
  };

  const getTypeColor = (active) => {
    if (active === true) {
      return "success";
    }

    if (active === false) {
      return "error";
    }
  };
  
  if (userInfo.accessLevel > USER_TYPE.ADMINISTRATOR) {
    return (
      <DashboardLayout>
        <Page title="Usuário">
          <Container maxWidth="xl">
            <Stack
              direction={{
                xs: "column",
                sm: "row",
                justifyContent: "space-between",
              }}
              spacing={{ xs: 3, sm: 2 }}
              mb={3}
            >
              <Typography variant="h5" paragraph>
                Lista de Usuários
              </Typography>
              
              <LoadingButton
                onClick={openNewDialog}
                type="button"
                size="medium"
                variant="contained"
                startIcon={<Add />}
              >
                Novo
              </LoadingButton>
            </Stack>

            <UserFilter onFilter={onFilter} />

            <UserList
              userList={userList}
              onDelete={() => performSearch({}, 1)}
              onFinishEdit={(fromEditOrSave) =>
                fromEditOrSave && performSearch(null, 1)
              }
              isLoading={isLoading}
            />

            <DialogAnimate
              open={isOpenNewDialog}
              onClose={closeNewDialog}
              widthMax={800}
            >
              <FormNewUser onClose={closeNewDialog} currentUser={currentUser} />
            </DialogAnimate>

            {userList.length > 0 && (
              <Box sx={{ mt: 5, display: "flex", justifyContent: "flex-end" }}>
                <Pagination
                  count={pages}
                  color="primary"
                  onChange={handlePageChange}
                  rowsPerPage={10}
                  page={actualPage}
                />
              </Box>
            )}
          </Container>
        </Page>
      </DashboardLayout>
    );
  } else {
    return (
      <DashboardLayout>
        <Page title="Usuário">
          <Container maxWidth="xl">
            <DialogAnimate
              open={isOpenNewDialog}
              onClose={closeNewDialog}
              widthMax={800}
            >
              <FormNewUser onClose={closeNewDialog} currentUser={currentUser} />
            </DialogAnimate>

            <Typography variant="h4" paragraph justifyContent="center">
              {userInfo.name}
            </Typography>

            <Avatar
              alt={`Imagem de ${userInfo.name}`}
              src={userInfo && userInfo.userPhoto ? userInfo.userPhoto : "/static/mock-images/avatars/avatar_default.jpg"}
              style={{ width: 140, height: 140, margin: "0 auto" }}
            />

            <div style={{ display: "flex", justifyContent: "center", padding: "24px 12px" }}>
              <Button
                variant="contained"
                onClick={() => handleIdPage(userInfo.id)}
              >
                Editar meus dados
              </Button>
            </div>

            <Card sx={{ pt: 5, pb: 6, pl: 3, pr: 3 }}>
              <Typography variant="h4" paragraph style={{ color: "#F23545" }}>
                Meus Dados
              </Typography>

              <Grid container spacing={6}>
                <Grid item xs={4}>
                  <div style={{ color: "#8b8b8b", fontSize: 14 }}>Nome</div>
                  {userInfo.name}
                </Grid>

                <Grid item xs={4}>
                  <div style={{ color: "#8b8b8b", fontSize: 14 }}>E-mail</div>
                  {userInfo.email}
                </Grid>

                <Grid item xs={4}>
                  <div style={{ color: "#8b8b8b", fontSize: 14 }}>Telefone</div>
                  {userInfo.name}
                </Grid>

                <Grid item xs={4}>
                  <div style={{ color: "#8b8b8b", fontSize: 14 }}>Tipo de Usuário</div>
                  {USER_TYPE_DESCRIPTION[userInfo.accessLevel]}
                </Grid>

                <Grid item xs={4}>
                  <div style={{ color: "#8b8b8b", fontSize: 14 }}>Status do Usuário</div>
                  <Label variant="filled" color={getTypeColor(userInfo.active)}>
                    {userInfo.active ? "Ativo" : "Inativo"}
                  </Label>
                </Grid>
              </Grid>
            </Card>
          </Container>
        </Page>
      </DashboardLayout>
    )
  }
}

export const getServerSideProps = withAuthLevel();

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(User);
