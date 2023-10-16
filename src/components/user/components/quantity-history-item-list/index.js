import React from "react";
import PropTypes from "prop-types";
import Label from "src/components/Label";
import { CircularProgress } from "@material-ui/core";
import {
  Grid,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from "@material-ui/core";

const QuantityHistoryItemsList = ({ quantityItems, isLoading }) => {
  console.log("quantityItems: ", quantityItems);

  return (
    <Grid item xs={12}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{ textAlign: "left" }} width="35%">
              Item
            </TableCell>
            <TableCell style={{ textAlign: "left" }}>Quantidade</TableCell>
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

          {!isLoading &&
            quantityItems
              .sort((a, b) => a.productTitle.localeCompare(b.productTitle))
              .map((item, index) => {
                const sumQuantity = item.quantity.reduce(
                  (accumulator, value) => accumulator + value,
                  0
                );

                return (
                  <TableRow key={index}>
                    <TableCell style={{ textAlign: "left" }}>
                      {item.productTitle}
                    </TableCell>
                    <TableCell style={{ textAlign: "left" }}>
                      {sumQuantity} - Unidades
                    </TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
    </Grid>
  );
};

QuantityHistoryItemsList.propTypes = {
  quantityItems: PropTypes.array,
  isLoading: PropTypes.bool,
};

export default QuantityHistoryItemsList;
