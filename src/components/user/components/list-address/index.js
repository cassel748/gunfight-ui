import React from "react";
import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import Label from "src/components/Label";
import baselineEdit from "@iconify/icons-ic/baseline-edit";
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
import { formatCep } from "src/utils/string";
import { ADDRESS_TYPE, getAddressColor, getEnumTitle } from "src/utils/enums";
import Toast from "src/utils/toast";

const ListAddress = ({ addressList, deleteItem, editItem, isLoading }) => {
  const onCopyAddress = (address) => {
    const text =
      address.address +
      ", N.º" +
      address.number +
      " / " +
      address.complement +
      " " +
      address.city +
      " - " +
      address.state +
      " -" +
      address.country;
    navigator.clipboard.writeText(text);

    Toast.success(`Endereço copiado com sucesso!`, {
      position: "bottom-center",
    });
  };
  return (
    <Grid item xs={12}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Rua</TableCell>
            <TableCell>Número</TableCell>
            <TableCell>Complemento</TableCell>
            <TableCell>Cidade</TableCell>
            <TableCell>Estado/Região</TableCell>
            <TableCell>Código Postal</TableCell>
            <TableCell>País</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell></TableCell>
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

          {!isLoading && addressList.length === 0 && (
            <div
              style={{
                position: "absolute",
                fontSize: 18,
                padding: 58,
                width: "100%",
                textAlign: "center",
              }}
            >
              Nenhum endereço cadastrado :(
            </div>
          )}

          {!isLoading &&
            addressList.map((address, index) => (
              <TableRow
                key={index}
                hover
                onClick={() => onCopyAddress(address)}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{address.address}</TableCell>
                <TableCell>{address.number}</TableCell>
                <TableCell>{address.complement}</TableCell>
                <TableCell>{address.city}</TableCell>
                <TableCell>{address.state}</TableCell>
                <TableCell>{formatCep(address.zipCode)}</TableCell>
                <TableCell>{address.country}</TableCell>
                <TableCell>
                  <Label variant="filled" color={getAddressColor(address.type)}>
                    {getEnumTitle(ADDRESS_TYPE, address.type)}
                  </Label>
                </TableCell>
                <TableCell>
                  <Tooltip title="Editar">
                    <IconButton onClick={() => editItem(address)}>
                      <Icon icon={baselineEdit} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Excluir">
                    <IconButton onClick={() => deleteItem(address)}>
                      <Icon icon={baselineDelete} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Grid>
  );
};

ListAddress.propTypes = {
  addressList: PropTypes.array.isRequired,
  deleteItem: PropTypes.func.isRequired,
};

export default ListAddress;
