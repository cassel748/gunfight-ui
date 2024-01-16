import React from "react";
import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import Label from "src/components/Label";
import { formatCurrency } from "src/utils/string";
import { CircularProgress } from "@material-ui/core";
import baselineEdit from "@iconify/icons-ic/baseline-edit";
import baselineDelete from "@iconify/icons-ic/baseline-delete";
import {
  getEnumTitle,
  getOriginColor,
  getStatusColor,
  TYPE_PRODUCT,
  SITUATION_PRODUCT,
} from "src/utils/enums";
import {
  Card,
  Table,
  Tooltip,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
  TableContainer,
} from "@material-ui/core";
import { RestrictedButton } from "src/components/RestrictedButton";
import { USER_TYPE } from "src/utils/auth";

const ListProducts = ({ products, deleteItem, editItem, isLoading }) => {
  return (
    <Card sx={{ mt: 5 }} style={{ minHeight: 500 }}>
      <TableContainer sx={{ minWidth: 800 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell width={"6%"}>Tamanho</TableCell>
              <TableCell width={"10%"}>Cor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell width={"10%"}>Em estoque</TableCell>
              <TableCell width={"15%"}>Descrição</TableCell>
              <TableCell width={"5%"}></TableCell>
              <TableCell width={"5%"}></TableCell>
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

            {!isLoading && products.length === 0 && (
              <div
                style={{
                  position: "absolute",
                  fontSize: 18,
                  padding: 58,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                Nenhum produto cadastrado :(
              </div>
            )}

            {!isLoading &&
              products.map((product, index) => (
                <TableRow key={index} hover>
                  <TableCell>{product.title}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>
                    <Label
                      variant="filled"
                      color={getOriginColor(product.type)}
                    >
                      {getEnumTitle(TYPE_PRODUCT, product.type)}
                    </Label>
                  </TableCell>
                  <TableCell>{product.size ? product.size : "-----"}</TableCell>
                  <TableCell>{product.color ? product.color : "N/A"}</TableCell>

                  <TableCell>
                    <Label
                      variant="filled"
                      color={getStatusColor(product.situation)}
                    >
                      {getEnumTitle(SITUATION_PRODUCT, product.situation)}
                    </Label>
                  </TableCell>
                  <TableCell>
                    {product.inventoryQuantity !== null &&
                    product.inventoryQuantity !== undefined &&
                    product.inventoryQuantity !== "" ? (
                      <Label
                        variant="filled"
                        color={getStatusColor(
                          product.inventoryQuantity <=
                            product.minimumInventoryQuantity
                            ? 2
                            : 1
                        )}
                      >
                        {product.inventoryQuantity} (Estoque{" "}
                        {product.inventoryQuantity <=
                        product.minimumInventoryQuantity
                          ? "Baixo"
                          : "Normal"}
                        )
                      </Label>
                    ) : (
                      "----"
                    )}
                  </TableCell>
                  <TableCell>
                    {product.description
                      ? product.description.length > 25
                        ? product.description.substring(0, 20) + " ..."
                        : product.description
                      : "Sem descrição"}
                  </TableCell>

                  <TableCell>
                    <Tooltip title="Editar">
                      <RestrictedButton onClick={() => editItem(product)} requiredAccessLevel={USER_TYPE.ADMINISTRATOR} icon>
                        <Icon icon={baselineEdit} />
                      </RestrictedButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Excluir">
                      <RestrictedButton onClick={() => deleteItem(product)} requiredAccessLevel={USER_TYPE.ADMINISTRATOR} icon>
                        <Icon icon={baselineDelete} />
                      </RestrictedButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

ListProducts.propTypes = {
  deleteItem: PropTypes.func,
  products: PropTypes.array.isRequired,
};

export default ListProducts;
