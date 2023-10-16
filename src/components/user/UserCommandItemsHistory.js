import { useEffect, useState } from "react";
import { Button, Stack, Typography } from "@material-ui/core";
import InvoiceHistoryItemsList from "./components/Invoice-history-item-list";
import { useAuthUser } from "next-firebase-auth";
import PageDev from "../page-dev";
import { LoadingButton } from "@material-ui/lab";
import { Add } from "@material-ui/icons";
import { DialogAnimate } from "../animate";
import ItemsHistoryItemsList from "./components/items-history-item-list";
import FormAddHistoryItem from "./components/form-Items-history-items";

export default function UserCommandItemsHistory({ userId }) {
  const AuthUser = useAuthUser();

  const [isLoadingList, setIsLoadingList] = useState(false);
  const [invoiceHistoryItemsList, setInvoiceHistoryItemsList] = useState([]);
  const [itemHistoryItemsList, setItemHistoryItemsList] = useState([]);

  const [isOpenAddItem, setIsOpenAddItem] = useState(false);

  const performSearch = async () => {
    try {
      setIsLoadingList(true);
      const token = await AuthUser.getIdToken();
      const response = await fetch(
        `/api/associate/invoice-history-items?associateId=${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: token,
          },
        }
      );
      const responseManualItem = await fetch(
        `/api/associate/item-associate-history?associateId=${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: token,
          },
        }
      );

      const dataItem = await responseManualItem.json();
      setItemHistoryItemsList(dataItem);


      const data = await response.json();
      setInvoiceHistoryItemsList(data);
    } catch (e) {
      console.log(e);
    }
    setIsLoadingList(false);
  };

  useEffect(() => {
    performSearch();
  }, []);

  const handleOpenAddItem = () => {
    setIsOpenAddItem(true);
  };

  const handleClose = shoulReload => {
    setIsOpenAddItem(false);
    if (shoulReload === true) {
      performSearch();
    }
  };

  return (
    <div style={{ padding: "18px 22px 0" }}>
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
          Histórico de consumo
        </Typography>

        <LoadingButton
          type="button"
          size="medium"
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAddItem}
        >
          Novo Item
        </LoadingButton>
      </Stack>

      <DialogAnimate open={isOpenAddItem} onClose={handleClose} widthMax={800}>
        <FormAddHistoryItem
          handleClose={handleClose}
          userId={userId}
        />
      </DialogAnimate>

      <InvoiceHistoryItemsList
        isLoading={isLoadingList}
        invoiceHistoryItems={invoiceHistoryItemsList}
      />

      <Typography variant="h5" paragraph mt={10}>
        Itens adicionados manualmente
      </Typography>
      <ItemsHistoryItemsList
        isLoading={isLoadingList}
        itemsHistoryItemsHistoryItems={itemHistoryItemsList}
      />


    </div>
  );
}
