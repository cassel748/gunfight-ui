import { useEffect, useState } from "react";
import Toast from "src/utils/toast";
import Page from "src/components/Page";
import Add from "@material-ui/icons/Add";
import Confirm from "src/components/Confirm";
import { LoadingButton } from "@material-ui/lab";
import DashboardLayout from "src/layouts/dashboard";
import { generateId, withAuthLevel } from "src/utils/auth";
import ListEvents from "src/components/internal-operation/events/list";
import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import EventsFilter from "src/components/internal-operation/events/filter";
import {
  Box,
  Stack,
  Container,
  Pagination,
  Typography,
} from "@material-ui/core";
import { useSelector } from "react-redux";

const Events = ({}) => {
  const AuthUser = useAuthUser();
  const userInfo = useSelector(state => state.user.userInfo);
  const generatedId = generateId();
  const [pages, setPages] = useState(0);
  const [actualPage, setActualPage] = useState(1);
  const [eventsItems, setEventsItems] = useState([]);
  const [currentEvent, setCurrentEvent] = useState({});
  const [actualFilter, setActualFilter] = useState(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);

  const deleteItem = (product) => {
    setIsOpenDeleteDialog(true);
    setCurrentEvent(product);
  };

  const deleteCloseDialog = () => {
    setIsOpenDeleteDialog(false);
    setCurrentEvent({});
  };
  const performSearch = async (values, page) => {
    try {
      setIsLoadingList(true);

      let url = "/api/internal/events";
      const queryParams = new URLSearchParams();

      queryParams.append("limit", 10);
      queryParams.append("page", page);

      if (values?.title) {
        queryParams.append("title", values.title);
      }
      if (values?.startDate) {
        queryParams.append("startDate", values.startDate);
      }
      if (values?.endDate) {
        queryParams.append("endDate", values.endDate);
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
      setEventsItems(data.results);
      setPages(data.pagination.pages);
      setActualPage(page);
    } catch (e) {
      console.log(e);
      setEventsItems([]);
    }
    setIsLoadingList(false);
  };

  useEffect(() => {
    performSearch(null, 1);
  }, []);

  const onDeleteConfirm = async () => {
    try {
      setIsLoadingDelete(true);
      const token = await AuthUser.getIdToken();
      const response = await fetch("/api/internal/events", {
        method: "DELETE",
        body: JSON.stringify({
          docId: currentEvent.docId,
          deletedBy: userInfo.id,
        }),
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();

      if (data.success) {
        Toast.success("Evento removido com sucesso!");
        performSearch(null, 1);
      }
    } catch (e) {
      Toast.error("Ocorreu um erro ao remover o Evento!");
      console.log(e);
    }
    setIsLoadingDelete(false);
    setIsOpenDeleteDialog(false);
  };

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

  return (
    <DashboardLayout>
      <Page title="Eventos">
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
              Eventos
            </Typography>
            <LoadingButton
              type="button"
              size="medium"
              variant="contained"
              startIcon={<Add />}
              href={`/internal/events/${generatedId}?isNew=true`}
            >
              Novo
            </LoadingButton>
          </Stack>

          <EventsFilter onFilter={onFilter} />

          <ListEvents
            events={eventsItems}
            deleteEvent={deleteItem}
            isLoading={isLoadingList}
          />

          {eventsItems.length > 0 && (
            <Box sx={{ mt: 5, display: "flex", justifyContent: "flex-end" }}>
              <Pagination
                count={pages}
                color="primary"
                rowsPerPage={10}
                page={actualPage}
                onChange={handlePageChange}
              />
            </Box>
          )}

          <Confirm
            title="Excluir Evento"
            open={isOpenDeleteDialog}
            onCancel={deleteCloseDialog}
            onConfirm={onDeleteConfirm}
            isLoading={isLoadingDelete}
            description={`Você tem certeza que deseja excluir o evento ${currentEvent.title}`}
          />
        </Container>
      </Page>
    </DashboardLayout>
  );
};

export const getServerSideProps = withAuthLevel();

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(Events);
