import React from "react";
import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import { CircularProgress } from "@material-ui/core";
import baselineEdit from "@iconify/icons-ic/baseline-edit";
import baselineDelete from "@iconify/icons-ic/baseline-delete";
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
import Label from "src/components/Label";
import {
  getEnumTitle,
  getWeaponSystemColor,
  getWeaponOriginColor,
  WEAPON_ORIGIN,
  WEAPON_ORIGIN_OR_CLUB,
} from "src/utils/enums";

const ListWeapons = ({ weapons, deleteItem, editItem, isLoading }) => {
  return (
    <Card sx={{ mt: 5 }} style={{ minHeight: 500 }}>
      <TableContainer sx={{ minWidth: 800 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={10}>Origem</TableCell>
              <TableCell>Marca / Modelo</TableCell>
              <TableCell>Espécie</TableCell>
              <TableCell>Calibre</TableCell>
              <TableCell>Órgão de registro</TableCell>
              <TableCell>N Série</TableCell>
              <TableCell width={15}></TableCell>
              <TableCell width={15}></TableCell>
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

            {!isLoading && weapons.length === 0 && (
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
              weapons.map((weapon, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Label
                      variant="filled"
                      color={getWeaponOriginColor(weapon?.originStoreOrClub)}
                    >
                      {weapon.originStoreOrClub
                        ? getEnumTitle(WEAPON_ORIGIN_OR_CLUB, weapon.originStoreOrClub)
                        : "N/A"}
                    </Label>
                  </TableCell>
                  <TableCell>{weapon.brand} - {weapon.model}</TableCell>
                  <TableCell>{weapon.species}</TableCell>
                  <TableCell>{weapon.caliber}</TableCell>
                  <TableCell>
                    <Label
                      variant="filled"
                      color={getWeaponSystemColor(weapon?.origin)}
                    >
                      {weapon.origin
                        ? getEnumTitle(WEAPON_ORIGIN, weapon.origin)
                        : "---------"}
                    </Label>
                  </TableCell>
                  <TableCell>{weapon.serialNumber}</TableCell>
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
      </TableContainer>
    </Card>
  );
};

ListWeapons.propTypes = {
  deleteItem: PropTypes.func,
  weapons: PropTypes.array.isRequired,
};

export default ListWeapons;
