import { useEffect, useState } from "react";
import { Stack, Typography } from "@material-ui/core";
import InvoiceHistoryList from "./components/invoice-history-list";
import { useAuthUser } from "next-firebase-auth";

export default function UserInChargeHistory({ userId }) {
  const AuthUser = useAuthUser();

  const [isLoadingList, setIsLoadingList] = useState(false);

  const [invoiceHistoryList, setInvoiceHistoryList] = useState([]);

  const performSearch = async () => {
    try {
      setIsLoadingList(true);
      const token = await AuthUser.getIdToken();
      const response = await fetch(
        `/api/associate/invoice-history?associateId=${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: token,
          },
        }
      );

      const data = await response.json();
      setInvoiceHistoryList(data);
    } catch (e) {
      console.log(e);
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
          Histórico de Comandas
        </Typography>
      </Stack>

      <InvoiceHistoryList
        invoiceHistory={invoiceHistoryList.sort(function (a, b) {
          return new Date(b.createdDate) - new Date(a.createdDate);
        })}
        isLoading={isLoadingList}
      />
    </div>
  );
}
