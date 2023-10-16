import React from "react";
import PropTypes from "prop-types";
import {
  Grid,
  Card,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  TableContainer,
  CircularProgress,
} from "@material-ui/core";
import { LoadingButton } from "@material-ui/lab";
import { formatCurrency } from "src/utils/string";

const CommandInvoiceList = ({
  addItem,
  isLoading,
  commandStatus,
  consumablesItems,
  removeCommandItem,
}) => {
  const itemsList = Object.keys(consumablesItems);

  return (
    <Card container xs={12} mt={3} sx={{ mt: 3 }}>
      <TableContainer sx={{ minHeight: 400 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={"3%"}>#</TableCell>
              <TableCell width={"17%"}>
                <span style={{ display: "block", textAlign: "left" }}>
                  Item
                </span>
              </TableCell>
              <TableCell width={"13%"}>Quantidade</TableCell>
              <TableCell width={"7%"}>Vendedor</TableCell>
              <TableCell width={"7%"}>Subtotal</TableCell>
              {!commandStatus || commandStatus === 3 ? null : (
                <TableCell width={"7%"} />
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <div
                style={{
                  padding: 58,
                  width: "100%",
                  fontSize: 18,
                  textAlign: "center",
                  position: "absolute",
                }}
              >
                <CircularProgress />
                <br />
                <br />
                Carregando...
              </div>
            )}

            {!isLoading && itemsList.length === 0 && (
              <div
                style={{
                  fontSize: 18,
                  padding: 58,
                  width: "100%",
                  textAlign: "center",
                  position: "absolute",
                }}
              >
                Nenhum item na comanda :(
              </div>
            )}

            {!isLoading &&
              itemsList.map((product, index) => {
                const items = consumablesItems[product];
                const productItem = items[0];
                let total = 0;
                let quantity = 0;
                let sellerName = "";

                for (let i = 0, n = items.length; i < n; i++) {
                  const product = items[i];
                  total += product.subtotal;
                  quantity += product.quantity;

                  sellerName += `${product.sellerName}(${product.quantity})`;

                  if (i < items.length - 1) {
                    sellerName += ", ";
                  }
                }

                return (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <span style={{ display: "block", textAlign: "left" }}>
                        {productItem.title}
                      </span>
                    </TableCell>
                    <TableCell>{quantity}</TableCell>
                    <TableCell>{sellerName}</TableCell>
                    <TableCell>{formatCurrency(total)}</TableCell>
                    {!commandStatus || commandStatus === 3 ? null : (
                      <TableCell>
                        <LoadingButton
                          fullWidth
                          type="button"
                          size="small"
                          loading={false}
                          variant="text"
                          onClick={removeCommandItem}
                        >
                          Remover
                        </LoadingButton>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <Grid container p={2} justifyContent="flex-end" alignItems="center">
        <Grid item sm={10} xs={12} />
        {!commandStatus || commandStatus === 3 ? null : (
          <Grid item>
            <LoadingButton
              fullWidth
              type="button"
              loading={false}
              variant="outlined"
              onClick={addItem}
            >
              + Adicionar
            </LoadingButton>
          </Grid>
        )}
      </Grid>
    </Card>
  );
};

CommandInvoiceList.propTypes = {
  userInfo: PropTypes.array,
  addItem: PropTypes.func,
  removeCommandItem: PropTypes.func,
  consumablesItems: PropTypes.object,
};

export default CommandInvoiceList;
