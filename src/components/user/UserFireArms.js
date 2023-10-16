import { useEffect, useState } from "react";
import Confirm from "../Confirm";
import Add from "@material-ui/icons/Add";
import { LoadingButton } from "@material-ui/lab";
import FireArmsList from "./components/fire-arms-list";
import FormFireArms from "./components/form-fire-arms";
import { Card, Stack, Typography } from "@material-ui/core";
import DialogAnimate from "src/components/animate/DialogAnimate";
import { useSelector } from "react-redux";
import { useAuthUser } from "next-firebase-auth";
import Toast from "src/utils/toast";

export default function UserFireArms({ userId }) {
  const AuthUser = useAuthUser();
  const userInfo = useSelector(state => state.user.userInfo);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isOpenEditDialog, setIsOpenEditDialog] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [weaponsList, setWeaponsList] = useState([]);
  const [currentWeapon, setCurrentWeapon] = useState({});

  const deleteItem = weapon => {
    setIsOpenDeleteDialog(true);
    setCurrentWeapon(weapon);
  }

  const deleteClose = () => {
    setIsOpenDeleteDialog(false);
    setCurrentWeapon({});
  };

  const handleOpenEdit = weapon => {
    setIsOpenEditDialog(true);

    if (weapon) {
      setCurrentWeapon(weapon);
    }
  };

  const performSearch = async () => {
    try {
      setIsLoadingList(true);
      const token = await AuthUser.getIdToken();
      const response = await fetch(`/api/associate/weapons?associateId=${userId}`, {
        method: 'GET',
        headers: {
          Authorization: token
        }
      });

      const data = await response.json();
      setWeaponsList(data);
    } catch(e) {
      console.log(e)
    }
    setIsLoadingList(false);
  };

  const handleCloseEdit = isFromSave => {
    setIsOpenEditDialog(false);

    if (isFromSave === true) {
      performSearch();
    }
  };

  useEffect(() => {
    performSearch();
  }, []);

  const onDeleteConfirm = async () => {
    try {
      setIsLoadingDelete(true)
      const token = await AuthUser.getIdToken();
      const response = await fetch('/api/associate/weapons', {
        method: 'DELETE',
        body: JSON.stringify({
          docId: currentWeapon.docId,
          deletedBy: userInfo.id
        }),
        headers: {
          Authorization: token
        }
      });

      const data = await response.json();

      if (data.success) {
        Toast.success('Arma removida com sucesso!');
        setIsOpenDeleteDialog(false);
        performSearch();
      }
    } catch(e) {
      console.log(e);
    }
    setIsLoadingDelete(false)
  }

  return (
    <Card sx={{ p: 3 }} style={{ minHeight: 500 }}>
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
          Lista de Armas
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

      <FireArmsList
        fireArms={weaponsList}
        deleteItem={deleteItem}
        editItem={handleOpenEdit}
        isLoading={isLoadingList}
      />

      <DialogAnimate open={isOpenEditDialog} onClose={handleCloseEdit} widthMax={800}>
        <FormFireArms handleClose={handleCloseEdit} userId={userId} currentWeapon={currentWeapon} />
      </DialogAnimate>

      <Confirm
        open={isOpenDeleteDialog}
        onCancel={deleteClose}
        onConfirm={onDeleteConfirm}
        description={`Você tem certeza que deseja excluir a arma ${currentWeapon.brand} ${currentWeapon.model} - ${currentWeapon.serialNumber}?`}
        isLoading={isLoadingDelete}
      />
    </Card>
  );
}
