import React, { useState } from "react";
import PropTypes from "prop-types";
import { formatCurrency } from "src/utils/string";
import { CircularProgress } from "@material-ui/core";
import { getDateLocalized } from "src/utils/localizedDateFns";
import {
  Grid,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Typography,
} from "@material-ui/core";

const ItemsHistoryItemsList = ({
  itemsHistoryItemsHistoryItems,
  isLoading,
}) => {
  const sumall = itemsHistoryItemsHistoryItems
    .map((item) => item.total)
    .reduce((prev, curr) => prev + curr, 0);

  return (
    <Grid item xs={12}>
      <Typography
        variant="h6"
        style={{ textAlign: "right", margin: 10, marginTop: 0 }}
      >
        Total: {formatCurrency(sumall ?? 0)}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width={"10%"}>Data</TableCell>
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

          {!isLoading && itemsHistoryItemsHistoryItems?.length === 0 && (
            <div
              style={{
                position: "absolute",
                fontSize: 18,
                padding: 58,
                width: "100%",
                textAlign: "center",
              }}
            >
              Nenhum histórico de item adicionado manualmente encontrado :,(
            </div>
          )}

          {!isLoading &&
            itemsHistoryItemsHistoryItems?.map((item, index) => {
              return (
                <TableRow key={index}>
                  <TableCell>
                    {getDateLocalized(new Date(item.date), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{item.item}</TableCell>
                  <TableCell>{item.commandNumber}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    <strong>{formatCurrency(item.unitValue)}</strong>
                  </TableCell>
                  <TableCell>
                    <strong>{formatCurrency(item.discount ?? 0)}</strong>
                  </TableCell>

                  <TableCell>
                    <strong>{formatCurrency(item.total ?? 0)}</strong>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </Grid>
  );
};

ItemsHistoryItemsList.propTypes = {
  itemsHistoryItemsHistoryItems: PropTypes.array,
  isLoading: PropTypes.bool,
};

export default ItemsHistoryItemsList;
