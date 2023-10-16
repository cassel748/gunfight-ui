import { useEffect, useState } from "react";
import { Stack, Typography } from "@material-ui/core";
import { useAuthUser } from "next-firebase-auth";
import EventHistoryList from "./components/event-history-list";

export default function UserEventsHistory({ userId }) {
  const AuthUser = useAuthUser();

  const [isLoadingList, setIsLoadingList] = useState(false);
  const [eventHistoryList, setEventHistoryList] = useState([]);

  const performSearch = async () => {
    try {
      setIsLoadingList(true);
      const token = await AuthUser.getIdToken();
      const response = await fetch(`/api/associate/event-history?associateId=${userId}`, {
        method: 'GET',
        headers: {
          Authorization: token
        }
      });

      const data = await response.json();
      setEventHistoryList(data);
    } catch (e) {
      console.log(e)
    }
    setIsLoadingList(false);
  };

  useEffect(() => {
    performSearch();
  }, []);


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
          Histórico de Habitualidades
        </Typography>
      </Stack>

      <EventHistoryList
        eventHistory={eventHistoryList}
        isLoading={isLoadingList}
      />
    </div>
  );
}
