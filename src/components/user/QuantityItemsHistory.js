import { useEffect, useState } from "react";
import { useAuthUser } from "next-firebase-auth";
import { Stack, Typography } from "@material-ui/core";
import QuantityHistoryItemsList from "./components/quantity-history-item-list";

export default function QuantityItemsHistory({ userId }) {
  const AuthUser = useAuthUser();

  const [isLoadingList, setIsLoadingList] = useState(false);
  const [itens, setItens] = useState([]);

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

      const data = await response.json();

      console.log(data);

      const items = data.invoiceItems?.reduce(
        (obj, { productTitle, quantity, subtotal }) => {
          if (!obj[productTitle]) obj[productTitle] = [];
          obj[productTitle].push(quantity);
          return obj;
        },
        {}
      );

      const item = Object.keys(items).map((productTitle, subtotal) => {
        return {
          productTitle,
          quantity: items[productTitle],
          subtotal,
        };
      });

      setItens(item);
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
          Quantidades por item
        </Typography>
      </Stack>

      <QuantityHistoryItemsList
        isLoading={isLoadingList}
        quantityItems={itens}
      />
    </div>
  );
}
