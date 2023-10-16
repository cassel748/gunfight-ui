import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { DialogAnimate } from "src/components/animate";
import { experimentalStyled as styled } from "@material-ui/core/styles";
import {
  Box,
  Card,
  Grid,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Typography,
  TableContainer,
  CircularProgress,
} from "@material-ui/core";
import "firebase/firestore";
import Label from "src/components/Label";
import { apiFetch } from "src/utils/apiFetch";
import { LoadingButton } from "@material-ui/lab";
import { getEnumTitle, getOriginColor, TYPE_PRODUCT } from "src/utils/enums";
import DialogAddConsumptionAssociated from "./dialog-add-consumption-associated";

const TableRowCell = styled(TableRow)(({ theme }) => ({
  cursor: "pointer",
  "&:hover": {
    background: theme.palette.background.default,
  },
}));

const AddConsumptionAssociated = ({ associateId, invoiceId, handleClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [productsItems, setProductsItems] = useState([1, 2, 3, 4, 5]);
  const [openedDialog, setOpenedDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({});

  const performSearch = async () => {
    try {
      setIsLoading(true);

      const data = await apiFetch(
        "/associate/wallet",
        {
          associateId,
          action: "INVENTORY",
        },
        "GET"
      );

      setProductsItems(data);
    } catch (e) {
      console.log(e);
      setProductsItems([]);
    }
    setIsLoading(false);
  };

  const handleCloseDialog = (value, closeAll) => {
    setOpenedDialog(value);
    if (closeAll) {
      handleClose(closeAll);
    }
  };

  useEffect(() => {
    performSearch();
  }, []);

  return (
    <>
      <Card>
        <Box sx={{ m: 3, display: "flex", justifyContent: "flex-start" }}>
          <Typography variant="h5">Inventário do Associado</Typography>
        </Box>
        <TableContainer sx={{ mt: 2, minHeight: 300 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="left" width={"40%"}>
                  Item
                </TableCell>
                <TableCell>Qtd. Disponível</TableCell>
                <TableCell>Qtd. Utilizada</TableCell>
                <TableCell>Tipo</TableCell>
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

              {!isLoading && productsItems.length === 0 && (
                <div
                  style={{
                    fontSize: 18,
                    padding: 58,
                    width: "100%",
                    textAlign: "center",
                    position: "absolute",
                  }}
                >
                  Nenhum item no inventário :(
                </div>
              )}

              {!isLoading &&
                productsItems.map((item, index) => (
                  <TableRowCell
                    onClick={() => {
                      setSelectedProduct(item);
                      setOpenedDialog(true);
                    }}
                    key={index}
                  >
                    <TableCell align="left">{item?.product?.title}</TableCell>
                    <TableCell>{item?.availableQuantity || "--"}</TableCell>
                    <TableCell>
                      {item?.quantity - item?.availableQuantity}
                    </TableCell>
                    <TableCell>
                      <Label
                        variant="filled"
                        color={getOriginColor(item?.product?.type)}
                      >
                        {getEnumTitle(TYPE_PRODUCT, item?.product?.type)}
                      </Label>
                    </TableCell>
                  </TableRowCell>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Grid container>
          <Grid item xs={9}></Grid>
          <Grid item xs={3} style={{ paddingBottom: 12, paddingRight: 12 }}>
            <LoadingButton
              fullWidth
              size="large"
              type="button"
              variant="outlined"
              onClick={() => handleClose()}
            >
              Cancelar
            </LoadingButton>
          </Grid>
        </Grid>
      </Card>

      <DialogAnimate
        widthMax={900}
        open={openedDialog}
        onClose={() => setOpenedDialog(false)}
      >
        <DialogAddConsumptionAssociated
          handleClose={handleCloseDialog}
          cancelConsumptionAdd={() => setOpenedDialog(false)}
          associateId={associateId}
          invoiceId={invoiceId}
          item={selectedProduct}
        />
      </DialogAnimate>
    </>
  );
};

AddConsumptionAssociated.propTypes = {
  handleClose: PropTypes.func,
  cancelConsumptionAdd: PropTypes.func,
};

export default AddConsumptionAssociated;
