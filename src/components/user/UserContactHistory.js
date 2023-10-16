import { useEffect, useState } from "react";
import Confirm from "../Confirm";
import Add from "@material-ui/icons/Add";
import { LoadingButton } from "@material-ui/lab";
import FormContact from "./components/form-contact";
import { Stack, Typography } from "@material-ui/core";
import DialogAnimate from "src/components/animate/DialogAnimate";
import ContactHistoricList from "./components/contact-historic-list";
import ViewContact from "./components/contact-historic-list/view-contact";
import { useAuthUser } from "next-firebase-auth";
import { CONTACT_HISTORY_REASONS, getEnumTitle } from "src/utils/enums";
import Toast from "src/utils/toast";
import { getDateLocalized } from "src/utils/localizedDateFns";
import { useSelector } from "react-redux";

export default function UserContactHistory({ userId }) {
  const AuthUser = useAuthUser();
  const userInfo = useSelector(state => state.user.userInfo);

  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isOpenViewItem, setIsOpenViewItem] = useState(false);
  const [isOpenAddItem, setIsOpenAddItem] = useState(false);
  const [isOpenDeleteItem, setIsOpenDeleteItem] = useState(false);

  const [contactHistoryList, setContactHistoryList] = useState([]);
  const [currentContactHistory, setCurrentContactHistory] = useState({});

  const performSearch = async () => {
    try {
      setIsLoadingList(true);
      const token = await AuthUser.getIdToken();
      const response = await fetch(`/api/associate/contact-history?associateId=${userId}`, {
        method: 'GET',
        headers: {
          Authorization: token
        }
      });

      const data = await response.json();
      setContactHistoryList(data);
    } catch (e) {
      console.log(e)
    }
    setIsLoadingList(false);
  };

  useEffect(() => {
    performSearch();
  }, []);

  const handleOpenAddItem = () => {
    setIsOpenAddItem(true);
    setCurrentContactHistory({});
  };

  const handleViewItem = item => {
    setCurrentContactHistory(item);
    setIsOpenViewItem(true);
  };

  const handleClose = shoulReload => {
    setIsOpenAddItem(false);
    if (shoulReload === true) {
      performSearch();
    }
  };

  const handleCloseView = () => {
    setIsOpenViewItem(false);
    setCurrentContactHistory({});
  };

  const handleDeleteItem = item => {
    setIsOpenDeleteItem(true);
    setCurrentContactHistory(item);
  };

  const handleCloseDeleteItem = () => {
    setIsOpenDeleteItem(false);
    setCurrentContactHistory({});
  };

  const onDeleteConfirm = async () => {
    try {
      setIsLoadingDelete(true)
      const token = await AuthUser.getIdToken();
      const response = await fetch('/api/associate/contact-history', {
        method: 'DELETE',
        body: JSON.stringify({
          docId: currentContactHistory.docId,
          deletedBy: userInfo.id
        }),
        headers: {
          Authorization: token
        }
      });

      const data = await response.json();

      if (data.success) {
        Toast.success('Histórico de contato removido com sucesso!');
        setIsOpenDeleteItem(false);
        performSearch();
      }
    } catch (e) {
      console.log(e);
    }
    setIsLoadingDelete(false)
  }

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
          Histórico de Contato
        </Typography>

        <LoadingButton
          type="button"
          size="medium"
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAddItem}
        >
          Novo
        </LoadingButton>
      </Stack>

      <ContactHistoricList
        contactHistory={contactHistoryList}
        onViewItem={handleViewItem}
        onDeleteItem={handleDeleteItem}
        isLoading={isLoadingList}
      />

      <DialogAnimate open={isOpenAddItem} onClose={handleClose} widthMax={800}>
        <FormContact
          handleClose={handleClose}
          userId={userId}
        />
      </DialogAnimate>

      <ViewContact
        open={isOpenViewItem}
        onClose={handleCloseView}
        data={currentContactHistory}
      />

      <Confirm
        open={isOpenDeleteItem}
        onCancel={handleCloseDeleteItem}
        onConfirm={onDeleteConfirm}
        description={`
          Você tem certeza que deseja excluir o histórito de contato referente a(o)
          ${getEnumTitle(CONTACT_HISTORY_REASONS, currentContactHistory.reason)}
          do dia ${currentContactHistory.date ? getDateLocalized(new Date(currentContactHistory.date), "dd/MM/yyyy") : ""}?
        `}
        isLoading={isLoadingDelete}
      />
    </div>
  );
}
