import React from "react";
import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import { CircularProgress } from "@material-ui/core";
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
import { formatCpf } from "src/utils/string";

const ListParticipants = ({ participants, deleteItem, isLoading }) => {
  return (
    <Card sx={{ mt: 5 }} style={{ minHeight: 500 }}>
      <TableContainer sx={{ minWidth: 800 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={"5%"}>#</TableCell>
              <TableCell width={"30%"}>Nome Completo</TableCell>
              <TableCell width={"30%"}>CPF</TableCell>
              <TableCell width={"30%"}>Número CR</TableCell>
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

            {!isLoading && participants.length === 0 && (
              <div
                style={{
                  position: "absolute",
                  fontSize: 18,
                  padding: 58,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                Nenhum participante no evento :(
              </div>
            )}

            {!isLoading &&
              participants.map((participant, index) => (
                <TableRow key={index} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{participant.name}</TableCell>
                  <TableCell>{formatCpf(participant.cpf)}</TableCell>
                  <TableCell>{participant.crNumber}</TableCell>

                  <TableCell />

                  <TableCell align="center">
                    <Tooltip title="Excluir">
                      <IconButton onClick={() => deleteItem(participant)}>
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

ListParticipants.propTypes = {
  deleteItem: PropTypes.func,
  participants: PropTypes.array.isRequired,
};

export default ListParticipants;
