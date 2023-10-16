import React from "react";
import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import Label from "src/components/Label";
import { CircularProgress } from "@material-ui/core";
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
import { getEnumTitle, getWeaponSystemColor, WEAPON_ORIGIN } from "src/utils/enums";

const FireArmsList = ({ fireArms, deleteItem, editItem, isLoading }) => {
  return (
    <Grid item xs={12}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Modelo</TableCell>
            <TableCell>Marca</TableCell>
            <TableCell>Espécie</TableCell>
            <TableCell>Número de Série</TableCell>
            <TableCell>Calibre</TableCell>
            <TableCell>Origem da Arma</TableCell>
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

          {!isLoading && fireArms.length === 0 && (
            <div
              style={{
                position: "absolute",
                fontSize: 18,
                padding: 58,
                width: "100%",
                textAlign: "center",
              }}
            >
              Nenhuma arma cadastrada :(
            </div>
          )}

          {!isLoading &&
            fireArms.map((weapon, index) => (
              <TableRow key={index} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{weapon.model}</TableCell>
                <TableCell>{weapon.brand}</TableCell>
                <TableCell>{weapon.species}</TableCell>
                <TableCell>{weapon.serialNumber}</TableCell>
                <TableCell>{weapon.caliber}</TableCell>
                <TableCell>
                  <Label variant="filled" color={getWeaponSystemColor(weapon?.origin)}>
                    {weapon.origin ? getEnumTitle(WEAPON_ORIGIN, weapon.origin) : "---------"}
                  </Label>
                </TableCell>
                <TableCell>
                  <Tooltip title="Editar">
                    <IconButton onClick={() => editItem(weapon)}>
                      <Icon icon={baselineEdit} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Excluir">
                    <IconButton onClick={() => deleteItem(weapon)}>
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

FireArmsList.propTypes = {
  deleteItem: PropTypes.func,
  fireArms: PropTypes.array.isRequired,
};

export default FireArmsList;
