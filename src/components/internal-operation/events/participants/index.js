import { useEffect, useState } from "react";
import Toast from "src/utils/toast";
import Add from "@material-ui/icons/Add";
import Confirm from "src/components/Confirm";
import { LoadingButton } from "@material-ui/lab";
import { DialogAnimate } from "src/components/animate";
import { Container, Stack, Typography } from "@material-ui/core";
import { useAuthUser } from "next-firebase-auth";
import ListParticipants from "./list";
import AddParticipant from "./add";
import { useSelector } from "react-redux";

// ----------------------------------------------------------------------

const Participants = ({ currentEvent }) => {
  const AuthUser = useAuthUser();
  const userInfo = useSelector(state => state.user.userInfo);

  const [participantsList, setParticipantsList] = useState([]);
  const [currentParticipant, setCurrentParticipant] = useState({});
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isOpenNewDialog, setIsOpenNewDialog] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);

  const deleteItem = (participant) => {
    setIsOpenDeleteDialog(true);
    setCurrentParticipant(participant);
  };

  const deleteCloseDialog = () => {
    setIsOpenDeleteDialog(false);
    setCurrentParticipant({});
  };

  const closeNewDialog = (shouldReload) => {
    setIsOpenNewDialog(false);

    if (shouldReload === true) {
      performSearch();
    }
  };

  const handleOpenEdit = (participant) => {
    setIsOpenNewDialog(true);

    if (participant) {
      setCurrentParticipant(participant);
    }
  };

  const performSearch = async () => {
    try {
      setIsLoadingList(true);
      const token = await AuthUser.getIdToken();
      const response = await fetch(`/api/internal/events/participants?eventId=${currentEvent.docId}`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();
      setParticipantsList(data.results);
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
      const response = await fetch(`/api/internal/events/participants?eventId=${currentEvent.docId}`, {
        method: "DELETE",
        body: JSON.stringify({
          docId: currentParticipant.docId,
          deletedBy: userInfo.id,
        }),
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();

      if (data.success) {
        Toast.success("Participante removido com sucesso!");
        setIsOpenDeleteDialog(false);
        performSearch();
      }
    } catch (e) {
      Toast.error("Ocorreu um erro ao remover o participante");
      console.log(e);
    }
    setIsOpenDeleteDialog(false);
    setIsLoadingDelete(false);
  };

  return (
    <div style={{ padding: "18px 0 0" }}>
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
            Participantes do evento
          </Typography>
          <LoadingButton
            type="button"
            size="medium"
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenEdit}
          >
            Adicionar Participante
          </LoadingButton>
        </Stack>

        <ListParticipants
          participants={participantsList}
          deleteItem={deleteItem}
          editItem={handleOpenEdit}
          isLoading={isLoadingList}
        />

        <DialogAnimate
          widthMax={800}
          open={isOpenNewDialog}
          onClose={closeNewDialog}
        >
          <AddParticipant
            handleClose={closeNewDialog}
            currentEvent={currentEvent}
          />
        </DialogAnimate>
      </Container>
      <Confirm
        title="Excluir Participante"
        open={isOpenDeleteDialog}
        onCancel={deleteCloseDialog}
        onConfirm={onDeleteConfirm}
        isLoading={isLoadingDelete}
        description={`Você tem certeza que deseja excluir o(a) participante ${currentParticipant.name} ?`}
      />
    </div>
  );
};

export default Participants;
