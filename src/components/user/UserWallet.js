import { useEffect, useState } from "react";
import Confirm from "../Confirm";
import Add from "@material-ui/icons/Add";
import { useSelector } from "react-redux";
import Remove from "@material-ui/icons/Remove";
import { LoadingButton } from "@material-ui/lab";
import ListWallet from "./components/list-wallet";
import FormWallet from "./components/form-wallet";
import { dispatchEvent } from "src/utils/events";
import { useAuthUser } from "next-firebase-auth";
import ShoppingBag from "@material-ui/icons/ShoppingBag";
import { FINANCIAL_OPERATION_ENUM } from "src/utils/enums";
import { Card, Stack, Typography } from "@material-ui/core";
import DialogAnimate from "src/components/animate/DialogAnimate";
import { USER_TYPE } from "src/utils/auth";

export default function UserWallet({ userId }) {
  const AuthUser = useAuthUser();
  const [walletList, setWalletList] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const userInfo = useSelector((state) => state.user.userInfo);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [currentWalletItem, setCurrentWalletItem] = useState({});
  const [isOpenEditDialog, setIsOpenEditDialog] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);

  const deleteItem = async (financial) => {
    await setCurrentWalletItem(financial);
    setIsOpenDeleteDialog(true);
  };

  const deleteClose = () => {
    setIsOpenDeleteDialog(false);
    setCurrentWalletItem({});
  };

  const handleOpenEdit = (type) => {
    setIsOpenEditDialog(true);
    setCurrentWalletItem({
      type,
    });
  };

  const performSearch = async () => {
    try {
      setIsLoadingList(true);
      const token = await AuthUser.getIdToken();
      const response = await fetch(
        `/api/associate/wallet?associateId=${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: token,
          },
        }
      );

      const data = await response.json();
      setWalletList(data);
    } catch (e) {
      console.log(e);
    }
    setIsLoadingList(false);
  };

  const handleCloseEdit = (isFromSave) => {
    setIsOpenEditDialog(false);

    if (isFromSave === true) {
      dispatchEvent("CurrentUser.reload");
      performSearch();
    }
  };

  useEffect(() => {
    performSearch();
  }, []);

  const onDeleteConfirm = async () => {
    try {
      setIsLoadingDelete(true);
      const token = await AuthUser.getIdToken();
      const response = await fetch("/api/associate/wallet", {
        method: "DELETE",
        body: JSON.stringify({
          docId: currentWalletItem.docId,
          deletedBy: userInfo.id,
          associateId: userId,
          type: currentWalletItem.type,
          value: currentWalletItem.value,
        }),
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();

      if (data.success) {
        setIsOpenDeleteDialog(false);
        performSearch();
        dispatchEvent("CurrentUser.reload");
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
          Carteira/Inventário
        </Typography>

        {userInfo.accessLevel > USER_TYPE.ADMINISTRATOR &&
          <div style={{ display: "flex", alignItems: "center", height: 30 }}>
            <h4 style={{ margin: "0 12px 0" }}>Adicionar: </h4>
            <LoadingButton
              type="button"
              size="medium"
              variant="contained"
              color="info"
              startIcon={<ShoppingBag />}
              onClick={() => handleOpenEdit(FINANCIAL_OPERATION_ENUM.PRODUCT)}
              style={{ marginRight: 12 }}
            >
              Produto
            </LoadingButton>

            <LoadingButton
              type="button"
              size="medium"
              variant="contained"
              color="success"
              startIcon={<Add />}
              onClick={() => handleOpenEdit(FINANCIAL_OPERATION_ENUM.CREDIT)}
              style={{ marginRight: 12 }}
            >
              Crédito
            </LoadingButton>

            <LoadingButton
              type="button"
              size="medium"
              variant="contained"
              color="error"
              startIcon={<Remove />}
              onClick={() => handleOpenEdit(FINANCIAL_OPERATION_ENUM.DEBIT)}
            >
              Débito
            </LoadingButton>
          </div>
        }
      </Stack>
      <ListWallet
        items={walletList.sort(function (a, b) {
          return new Date(b.date) - new Date(a.date);
        })}
        deleteItem={deleteItem}
        isLoading={isLoadingList}
      />

      <Stack spacing={3}></Stack>

      <DialogAnimate
        open={isOpenEditDialog}
        onClose={handleCloseEdit}
        widthMax={800}
      >
        <FormWallet
          handleClose={handleCloseEdit}
          userId={userId}
          currentWalletItem={currentWalletItem}
        />
      </DialogAnimate>

      <Confirm
        title="Excluir Item"
        onCancel={deleteClose}
        open={isOpenDeleteDialog}
        onConfirm={onDeleteConfirm}
        isLoading={isLoadingDelete}
        description={`Você tem certeza que deseja excluir esse item da carteira?`}
      />
    </Card>
  );
}
