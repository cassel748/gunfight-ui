import { useEffect, useState } from "react";
import Confirm from "../Confirm";
import Add from "@material-ui/icons/Add";

import { formatCep } from "src/utils/string";
import { LoadingButton } from "@material-ui/lab";
import ListAddress from "./components/list-address";
import FormAddress from "./components/form-address";
import { Card, Stack, Typography } from "@material-ui/core";
import DialogAnimate from "src/components/animate/DialogAnimate";
import { useAuthUser } from "next-firebase-auth";
import { useSelector } from "react-redux";

export default function UserAddress({ userId }) {
  const AuthUser = useAuthUser();
  const userInfo = useSelector((state) => state.user.userInfo);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [addressList, setAddressList] = useState([]);
  const [currentAddress, setCurrentAddress] = useState({});

  const [isOpenEditDialog, setIsOpenEditDialog] = useState(false);

  useEffect(() => {
    if (addressList.length !== 0) {
      setIsOpenEditDialog(false);
    }
  }, [addressList]);

  const deleteItem = (address) => {
    setIsOpenDeleteDialog(true);
    setCurrentAddress(address);
  };

  const deleteClose = () => {
    setIsOpenDeleteDialog(false);
    setCurrentAddress({});
  };

  const handleOpenEdit = (address) => {
    setIsOpenEditDialog(true);

    if (address) {
      setCurrentAddress(address);
    }
  };

  const performSearch = async (fromDelete) => {
    try {
      setIsLoadingList(true);
      const token = await AuthUser.getIdToken();
      const response = await fetch(
        `/api/associate/address?associateId=${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: token,
          },
        }
      );

      const data = await response.json();
      setAddressList(data);

      if (!data.length && !fromDelete) {
        setIsOpenEditDialog(true);
      }
    } catch (e) {
      console.log(e);
    }
    setIsLoadingList(false);
  };

  const handleCloseEdit = (isFromSave) => {
    setIsOpenEditDialog(false);

    if (isFromSave === true) {
      performSearch(true);
    }
  };

  useEffect(() => {
    performSearch();
  }, []);

  const onDeleteConfirm = async () => {
    try {
      setIsLoadingDelete(true);
      const token = await AuthUser.getIdToken();
      const response = await fetch("/api/associate/address", {
        method: "DELETE",
        body: JSON.stringify({
          docId: currentAddress.docId,
          deletedBy: userInfo.id,
        }),
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();

      if (data.success) {
        setIsOpenDeleteDialog(false);
        performSearch(true);
      }
    } catch (e) {
      console.log(e);
    }
    setIsLoadingDelete(false);
  };

  return (
    <Card sx={{ p: 3 }} style={{ minHeight: 500 }}>
      <Stack
        mb={3}
        direction={{
          xs: "column",
          sm: "row",
          justifyContent: "space-between",
        }}
        spacing={{ xs: 3, sm: 2 }}
      >
        <Typography variant="h5" paragraph>
          Lista de Endereços
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

      <ListAddress
        addressList={addressList}
        deleteItem={deleteItem}
        editItem={handleOpenEdit}
        isLoading={isLoadingList}
      />

      <Stack spacing={3}></Stack>

      <DialogAnimate
        open={isOpenEditDialog}
        onClose={handleCloseEdit}
        widthMax={800}
      >
        <FormAddress
          handleClose={handleCloseEdit}
          userId={userId}
          currentAddress={currentAddress}
        />
      </DialogAnimate>

      <Confirm
        open={isOpenDeleteDialog}
        onCancel={deleteClose}
        onConfirm={onDeleteConfirm}
        title="Excluir endereço"
        description={`Você tem certeza que deseja excluir seu endereço ${
          currentAddress.type
        } - CEP ${formatCep(currentAddress.zipCode)}?`}
        isLoading={isLoadingDelete}
      />
    </Card>
  );
}
