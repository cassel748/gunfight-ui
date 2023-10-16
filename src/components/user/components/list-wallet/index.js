import React from "react";
import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import Label from "src/components/Label";
import baselineDelete from "@iconify/icons-ic/baseline-delete";
import {
  Grid,
  Table,
  Tooltip,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
} from "@material-ui/core";
import { CircularProgress } from "@material-ui/core";
import { formatCurrency } from "src/utils/string";
import {
  FINANCIAL_OPERATION_WALLET,
  getEnumTitle,
  getFinancialColor,
} from "src/utils/enums";
import { getDateLocalized } from "src/utils/localizedDateFns";
import { RestrictedButton } from "src/components/RestrictedButton";
import { USER_TYPE } from "src/utils/auth";

const ListWallet = ({ items, deleteItem, isLoading }) => {
  const getDescription = (item) => {
    // productId
    // console.log("item:", item.product);
    return item?.description || item?.product?.title;
  };

  const verifyTypeItem = (type) => {
    if (type === 3) {
      type = "Aula de Personal";
    }
    if (type === undefined) {
      type = "----";
    }
    return type;
  };

  return (
    <Grid item xs={12}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Data</TableCell>
            <TableCell>Descrição</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Qtd.</TableCell>
            <TableCell>Qtd. Disponível</TableCell>
            <TableCell>Qtd. Utilizada</TableCell>
            <TableCell>Desconto</TableCell>
            <TableCell>Valor</TableCell>
            <TableCell></TableCell>
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

          {!isLoading && items.length === 0 && (
            <div
              style={{
                position: "absolute",
                fontSize: 18,
                padding: 58,
                width: "100%",
                textAlign: "center",
              }}
            >
              Nenhum transação encontrada.
            </div>
          )}
          {!isLoading &&
            items
              .sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
              })
              .map((address, index) => (
                <TableRow key={index} hover>
                  {address.type === 3 ? (
                    <>
                      {" "}
                      <TableCell>
                        {getDateLocalized(
                          new Date(address.createdAt),
                          "dd/MM/yyyy - HH:mm"
                        )}
                      </TableCell>
                      <TableCell>{verifyTypeItem(address.type)}</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>
                        {getDateLocalized(
                          new Date(address.date),
                          "dd/MM/yyyy - HH:mm"
                        )}
                      </TableCell>
                      <TableCell>{getDescription(address)}</TableCell>
                    </>
                  )}
                  <TableCell>
                    <Label
                      variant="filled"
                      color={getFinancialColor(address.type)}
                    >
                      {getEnumTitle(FINANCIAL_OPERATION_WALLET, address.type)}
                    </Label>
                  </TableCell>

                  <TableCell>{address.quantity || "N/A"}</TableCell>
                  <TableCell>{address.availableQuantity || "N/A"}</TableCell>
                  <TableCell>
                    {address.quantity
                      ? address.quantity - address.availableQuantity
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(address.discount) || "N/A"}
                  </TableCell>

                  <TableCell>{formatCurrency(address.value)}</TableCell>

                  <TableCell align="center">
                    <Tooltip title="Excluir">
                      <RestrictedButton
                        icon
                        requiredAccessLevel={USER_TYPE.ADMINISTRATOR}
                        onClick={() => deleteItem(address)}
                      >
                        <Icon icon={baselineDelete} />
                      </RestrictedButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </Grid>
  );
};

ListWallet.propTypes = {
  items: PropTypes.array.isRequired,
  deleteItem: PropTypes.func.isRequired,
};

export default ListWallet;
