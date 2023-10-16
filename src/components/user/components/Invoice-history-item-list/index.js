import React from "react";
import PropTypes from "prop-types";
import {
  Grid,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Typography,
  Button,
  useTheme,
} from "@material-ui/core";
import { CircularProgress } from "@material-ui/core";
import { formatCurrency } from "src/utils/string";
import { getDateLocalized } from "src/utils/localizedDateFns";

const InvoiceHistoryItemsList = ({ invoiceHistoryItems, isLoading }) => {
  const theme = useTheme();
  return (
    <Grid item xs={12}>
      <Typography
        variant="h6"
        style={{ textAlign: "right", margin: 10, marginTop: 0 }}
      >
        Total: {formatCurrency(invoiceHistoryItems?.mainTotal ?? 0)}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width={"10%"}>Data/Hora</TableCell>
            <TableCell width={"30%"}>Item</TableCell>
            <TableCell width={"10%"}>Número Comanda</TableCell>
            <TableCell width={"10%"}>Quantidade</TableCell>
            <TableCell width={"10%"}>Valor unt</TableCell>
            <TableCell width={"10%"}>Desconto</TableCell>
            <TableCell width={"10%"}>Valor total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading && (
            <div
              style={{
                position: "absolute",
                fontSize: 18,
                padding: 58,
                width: "100%",
                textAlign: "center",
              }}
            >
              <CircularProgress />
              <br />
              <br />
              Carregando...
            </div>
          )}

          {!isLoading && invoiceHistoryItems?.invoiceItems?.length === 0 && (
            <div
              style={{
                position: "absolute",
                fontSize: 18,
                padding: 58,
                width: "100%",
                textAlign: "center",
              }}
            >
              Nenhum histórico de comanda encontrado :,(
            </div>
          )}

          {!isLoading &&
            invoiceHistoryItems?.invoiceItems
              ?.filter(
                (item) => item.productType !== 3 && item.productType !== 1
              )
              .sort(function (a, b) {
                return new Date(b.createdDate) - new Date(a.createdDate);
              })
              .map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {getDateLocalized(new Date(item.createdDate), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{item.productTitle}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      color="inherit"
                      sx={{ color: theme.palette.error.main }}
                      href={`/actions/invoices/${item.invoiceId}`}
                    >
                      {item.invoiceNumber}
                    </Button>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    <strong>{formatCurrency(item.productPrice)}</strong>
                  </TableCell>
                  <TableCell>
                    <strong>{formatCurrency(item.itemDiscount ?? 0)}</strong>
                  </TableCell>
                  <TableCell>
                    <strong>{formatCurrency(item.itemTotal ?? 0)}</strong>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </Grid>
  );
};

InvoiceHistoryItemsList.propTypes = {
  invoiceHistoryItems: PropTypes.array,
  isLoading: PropTypes.bool,
};

export default InvoiceHistoryItemsList;
