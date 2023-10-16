import React from "react";
import PropTypes from "prop-types";
import { Card } from "@material-ui/core";
import { CircularProgress } from "@material-ui/core";
import { TableContainer, Table, TableBody, TableRow, TableCell, Paper } from "@material-ui/core";
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { formatCpf } from "src/utils/string";
import { TableHead } from "@material-ui/core";

const AddList = ({ participants, onSelect, isLoading, noResults }) => {
  const handleSelectParticipant = index => {
    onSelect(index);
  };

  return (
    <Card sx={{ mt: 3, minHeight: 250 }}>
      {isLoading && (
        <div
          style={{
            fontSize: 18,
            padding: 58,
            width: "100%",
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

      {!isLoading && participants.length === 0 && noResults && (
        <div
          style={{
            padding: 58,
            width: "100%",
            fontSize: 18,
            textAlign: "center",
            position: "absolute",
          }}
        >
          Nenhum associado encontrado :(
        </div>
      )}

      {
        participants.length === 0 &&
        !isLoading &&
        !noResults && (
          <div
            style={{
              padding: 58,
              width: "100%",
              fontSize: 18,
              textAlign: "center",
              position: "absolute",
            }}
          >
            Pesquise Associados pelo Nome, CPF, Número CR, Email ou Celular
          </div>
        )
      }

      {!isLoading && (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableCell><span style={{display: "block", textAlign: "left"}}>Nome</span></TableCell>
                <TableCell>CPF</TableCell>
                <TableCell></TableCell>
              </TableHead>
              <TableBody>
                {participants.map((participant, index) => (
                  <TableRow
                    key={index}
                    sx={{ height: 55, cursor: "pointer", fontSize: "20px", '&:last-child td, &:last-child th': { border: 0 } }}
                    onClick={() => handleSelectParticipant(index)}
                    hover
                  >
                    <TableCell width="50%">
                      <span style={{display: "block", textAlign: "left"}}>
                        {participant.name}
                      </span>
                    </TableCell>
                    <TableCell>{formatCpf(participant.cpf)}</TableCell>
                    <TableCell width="12%">
                      {
                        participant.selected ?
                          <CheckBoxIcon style={{color: "green"}} />
                        :
                          <CheckBoxOutlineBlankIcon />
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
      )}
    </Card>
  );
};

AddList.propTypes = {
  deleteItem: PropTypes.func,
  participants: PropTypes.array.isRequired,
};

export default AddList;
