import { useEffect, useState } from "react";
import Toast from "src/utils/toast";
import Page from "src/components/Page";
import Add from "@material-ui/icons/Add";
import Confirm from "src/components/Confirm";
import { withAuthLevel } from "src/utils/auth";
import { LoadingButton } from "@material-ui/lab";
import DashboardLayout from "src/layouts/dashboard";
import { DialogAnimate } from "src/components/animate";
import { Container, Stack, Typography } from "@material-ui/core";
import FormWeapon from "src/components/internal-operation/weapons/form";
import WeaponsList from "src/components/internal-operation/weapons/list";
import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import WeaponsFilter from "src/components/internal-operation/weapons/filter";
import { useSelector } from "react-redux";

// ----------------------------------------------------------------------

const Weapons = ({}) => {
  const AuthUser = useAuthUser();
  const userInfo = useSelector(state => state.user.userInfo);

  const [weaponsItems, setWeaponsItems] = useState([]);
  const [currentWeapon, setCurrentWeapon] = useState({});
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isOpenNewDialog, setIsOpenNewDialog] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);

  const deleteItem = (weapon) => {
    setIsOpenDeleteDialog(true);
    setCurrentWeapon(weapon);
  };

  const deleteCloseDialog = () => {
    setIsOpenDeleteDialog(false);
    setCurrentWeapon({});
  };

  const closeNewDialog = (shouldReload) => {
    setIsOpenNewDialog(false);

    if (shouldReload === true) {
      performSearch();
    }
  };

  const handleOpenEdit = (weapon) => {
    setIsOpenNewDialog(true);

    if (weapon) {
      setCurrentWeapon(weapon);
    }
  };

  const performSearch = async (values) => {
    try {
      setIsLoadingList(true);
      let url = "/api/internal/weapons";
      const queryParams = new URLSearchParams();

      if (values?.model) {
        queryParams.append("model", values.model);
      }
      if (values?.brand) {
        queryParams.append("brand", values.brand);
      }
      if (values?.caliber) {
        queryParams.append("caliber", values.caliber);
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
      setWeaponsItems(data);
    } catch (e) {
      console.log(e);
    }
    setIsLoadingList(false);
  };

  useEffect(() => {
    performSearch();
  }, []);

  const onDeleteConfirm = async () => {
    try {
      setIsLoadingDelete(true);
      const token = await AuthUser.getIdToken();
      const response = await fetch("/api/internal/weapons", {
        method: "DELETE",
        body: JSON.stringify({
          docId: currentWeapon.docId,
          deletedBy: userInfo.id,
        }),
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();

      if (data.success) {
        Toast.success("Arma removida com sucesso!");
        setIsOpenDeleteDialog(false);
        performSearch();
      }
    } catch (e) {
      Toast.error("Ocorreu um erro ao remover a arma!");
      console.log(e);
    }
    setIsOpenDeleteDialog(false);
    setIsLoadingDelete(false);
  };

  const onFilter = (values) => {
    performSearch(values);
  };

  return (
    <DashboardLayout>
      <Page title="Criação de Arma">
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
              Armas Internas
            </Typography>
            <LoadingButton
              type="button"
              size="medium"
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenEdit}
            >
              Novo
            </LoadingButton>
          </Stack>
          <WeaponsFilter onFilter={onFilter} />

          <WeaponsList
            weapons={weaponsItems}
            deleteItem={deleteItem}
            editItem={handleOpenEdit}
            isLoading={isLoadingList}
          />
          <DialogAnimate
            widthMax={800}
            open={isOpenNewDialog}
            onClose={closeNewDialog}
          >
            <FormWeapon
              handleClose={closeNewDialog}
              currentWeapon={currentWeapon}
            />
          </DialogAnimate>
        </Container>
        <Confirm
          title="Excluir Arma"
          open={isOpenDeleteDialog}
          onCancel={deleteCloseDialog}
          onConfirm={onDeleteConfirm}
          isLoading={isLoadingDelete}
          description={`Você tem certeza que deseja excluir a arma ${currentWeapon.brand} ${currentWeapon.model}?`}
        />
      </Page>
    </DashboardLayout>
  );
};

export const getServerSideProps = withAuthLevel();

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(Weapons);
