import React, { useState } from "react";
import {
  Grid,
  Card,
  Table,
  Tooltip,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Typography,
  IconButton,
  TableContainer,
  CircularProgress,
} from "@material-ui/core";
import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import Label from "src/components/Label";
import { useSelector } from "react-redux";
import { USER_TYPE } from "src/utils/auth";
import { makeStyles } from "@material-ui/styles";
import { LoadingButton } from "@material-ui/lab";
import { formatCurrency } from "src/utils/string";
import infoFill from "@iconify/icons-eva/info-fill";
import { getEnumTitle, TYPE_PRODUCT } from "src/utils/enums";
import { getDateLocalized } from "src/utils/localizedDateFns";
import { RestrictedButton } from "src/components/RestrictedButton";

const useStyles = makeStyles({
  textAlcool: {
    color: "#FDD835",
    fontWeight: "500",
  },
});

const CommandInvoiceList = ({
  addItem,
  editItem,
  isLoading,
  invoiceData,
  commandStatus,
  consumablesItems,
  removeCommandItem,
}) => {
  const [gunDetailModal, setGunDetailModal] = useState(false);

  const classes = useStyles();

  const userInfo = useSelector((state) => state.user.userInfo);

  let isAlcool = "";

  const seeGunDetail = () => {
    setGunDetailModal(true);
  };

  return (
    <Card container xs={12} mt={3} sx={{ mt: 3 }}>
      <TableContainer sx={{ minHeight: 400 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={"21%"}>
                <span style={{ display: "block", textAlign: "left" }}>
                  Item
                </span>
              </TableCell>
              <TableCell width={"10%"}>Data/Hora</TableCell>
              <TableCell width={"5%"}>Qnt</TableCell>
              <TableCell width={"7%"}>Valor Unitário</TableCell>
              <TableCell width={"7%"}>Vendedor</TableCell>
              <TableCell width={"7%"}>Subtotal</TableCell>
              <TableCell width={"7%"}>Desconto Item</TableCell>
              <TableCell width={"7%"}>Total Item</TableCell>
              {!commandStatus ||
              commandStatus === 2 ||
              commandStatus === 3 ? null : (
                <>
                  <TableCell width={"7%"} />
                  {userInfo.accessLevel === 99 && <TableCell width={"7%"} />}
                </>
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

            {!isLoading && consumablesItems.length === 0 && (
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
              consumablesItems
                .sort(function (a, b) {
                  return new Date(b.createdAt) - new Date(a.createdAt);
                })
                .map((consumables, index) => (
                  <TableRow key={index}>
                    {
                      (isAlcool =
                        consumables.productId === "ZCRZFh0eVCIay3NsRTIt" ||
                        consumables.productId === "h8Ztpg9TEFNg4NhIQk0u" ||
                        consumables.productId === "jcNFxROLaqiVcQbVGOhA" ||
                        consumables.productId === "MzoKtqDzKf5qWf4L3qta" ||
                        consumables.productId === "u8ceAONL9h0Tv0RySkab" ||
                        consumables.productId === "rARjmrnnmbu8P7znlefS" ||
                        consumables.productId === "QMgsZeaf1uLhyYhp6RyW")
                    }

                    <TableCell className={isAlcool && classes.textAlcool}>
                      <span style={{ display: "block", textAlign: "left" }}>
                        <Tooltip
                          title={getEnumTitle(
                            TYPE_PRODUCT,
                            consumables.productType
                          )}
                          placement="left-start"
                        >
                          <IconButton sx={{ marginLeft: -3 }}>
                            <Icon
                              onClick={() => {}}
                              icon={infoFill}
                              style={{ width: 15, height: 15 }}
                            />
                          </IconButton>
                        </Tooltip>
                        {consumables.productTitle}
                        {isAlcool ? (
                          <Label color="warning" style={{ marginLeft: 7 }}>
                            Alcoólico
                          </Label>
                        ) : (
                          ""
                        )}
                        {consumables.fromInventory ? (
                          <Label color="warning" style={{ marginLeft: 12 }}>
                            Inventário
                          </Label>
                        ) : (
                          ""
                        )}
                        {consumables.gunDetail ? (
                          <Label color="warning" style={{ marginLeft: 12 }}>
                            {consumables.gunDetail.substring(0, 45)}
                            {consumables.gunDetail.length > 24 ? "..." : ""}
                          </Label>
                        ) : (
                          ""
                        )}
                        {consumables.modelWeapon ? (
                          <Label color="warning" style={{ marginLeft: 12 }}>
                            {consumables.modelWeapon.substring(0, 45)}
                            {consumables.modelWeapon.length > 24 ? "..." : ""}
                          </Label>
                        ) : (
                          ""
                        )}
                      </span>
                    </TableCell>
                    <TableCell className={isAlcool && classes.textAlcool}>
                      {getDateLocalized(
                        new Date(consumables.createdAt),
                        "dd/MM • HH:mm"
                      )}
                    </TableCell>
                    <TableCell className={isAlcool && classes.textAlcool}>
                      {consumables.quantity}
                    </TableCell>
                    <TableCell className={isAlcool && classes.textAlcool}>
                      {formatCurrency(consumables.productPrice)}
                    </TableCell>
                    <TableCell className={isAlcool && classes.textAlcool}>
                      {consumables.sellerName}
                    </TableCell>
                    <TableCell className={isAlcool && classes.textAlcool}>
                      {formatCurrency(consumables.subtotal)}
                    </TableCell>
                    <TableCell
                      className={isAlcool && classes.textAlcool}
                      width={"7%"}
                    >
                      {consumables.itemDiscount
                        ? formatCurrency(consumables.itemDiscount)
                        : formatCurrency(0)}
                    </TableCell>
                    <TableCell
                      className={isAlcool && classes.textAlcool}
                      width={"7%"}
                    >
                      {consumables.itemTotal !== undefined
                        ? formatCurrency(consumables.itemTotal) || 0
                        : "N/A"}
                    </TableCell>

                    {!commandStatus ||
                    commandStatus === 2 ||
                    commandStatus === 3 ? null : (
                      <>
                        {!consumables.fromInventory ? (
                          <TableCell>
                            <RestrictedButton
                              fullWidth
                              type="button"
                              size="small"
                              loading={false}
                              variant="text"
                              onClick={() => editItem(consumables)}
                              requiredAccessLevel={USER_TYPE.ADMINISTRATOR}
                            >
                              Editar
                            </RestrictedButton>
                          </TableCell>
                        ) : (
                          <TableCell />
                        )}

                        <TableCell>
                          <RestrictedButton
                            fullWidth
                            type="button"
                            size="small"
                            variant="text"
                            loading={false}
                            requiredAccessLevel={USER_TYPE.ADMINISTRATOR}
                            onClick={() => removeCommandItem(consumables)}
                          >
                            Remover
                          </RestrictedButton>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
          </TableBody>
          <TableBody style={{ position: "absolute", bottom: 0, margin: 20 }}>
            <>
              {commandStatus !== undefined && commandStatus === 3 && (
                <Grid>
                  <Typography
                    variant="subtitle1"
                    style={{
                      marginRight: 12,
                      color: "#FFE16A",
                    }}
                  >
                    Observações
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    style={{
                      marginRight: 12,
                    }}
                  >
                    {invoiceData.observation === ""
                      ? `Comanda finalizada sem observações`
                      : `${invoiceData.observation}`}
                  </Typography>
                </Grid>
              )}
            </>
          </TableBody>
        </Table>
      </TableContainer>
      <Grid container p={2} justifyContent="flex-end" alignItems="center">
        <Grid item sm={10} xs={12} />
        {!commandStatus || commandStatus === 2 || commandStatus === 3 ? null : (
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
  editItem: PropTypes.func,
  removeCommandItem: PropTypes.func,
  consumablesItems: PropTypes.array,
};

export default CommandInvoiceList;
