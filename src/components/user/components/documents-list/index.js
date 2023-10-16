import React from "react";
import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import baselineEdit from "@iconify/icons-ic/baseline-edit";
import baselineDelete from "@iconify/icons-ic/baseline-delete";
import baselineRemoveRedEye from "@iconify/icons-ic/baseline-remove-red-eye";
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
import { DOCUMENTS, getEnumTitle } from "src/utils/enums";
import Label from "src/components/Label";
import { getDateLocalized } from "src/utils/localizedDateFns";

const DocumentsList = ({ docs, deleteItem, isLoading, handleEditDocument }) => {

  const showDueDate = (type) => {
    let nonValidTypes = [8, 10, 12];
    return !nonValidTypes.includes(type);
  }

  return (
    <Grid item xs={12}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width={1}>#</TableCell>
            <TableCell width={60}>Documento</TableCell>
            <TableCell width={10}>Vencimento</TableCell>
            <TableCell width={10}>Status</TableCell>
            <TableCell width={10}>Observação</TableCell>
            <TableCell width={30} />
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

          {!isLoading && docs.length === 0 && (
            <div
              style={{
                position: "absolute",
                fontSize: 18,
                padding: 58,
                width: "100%",
                textAlign: "center",
              }}
            >
              Nenhum documento cadastrado :(
            </div>
          )}

          {!isLoading &&
            docs.map((doc, index) => (
              <TableRow key={index} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{getEnumTitle(DOCUMENTS, doc.type)}</TableCell>
                <TableCell>
                  {doc.expireDate ? getDateLocalized(new Date(doc.expireDate), "dd/MM/yyyy") : "Vencimento não informado"}
                </TableCell>
                {
                  doc.expireDate ? (
                    <TableCell>
                      {
                        doc.expireDate &&
                          new Date(doc.expireDate).getTime() < new Date().getTime() ?
                          <Label variant="filled" color="error">Vencido</Label>
                          :
                          <Label variant="filled" color="success">Válido</Label>
                      }
                    </TableCell>
                  ) : <TableCell></TableCell>
                }
                <TableCell>{doc?.observation?.substring(0, 30)} {doc.observation?.length > 24 ? "..." : "N/A"}</TableCell>

                <TableCell>
                  {showDueDate(doc.type) && <Tooltip title="Editar">
                    <IconButton onClick={() => handleEditDocument(doc)}>
                      <Icon icon={baselineEdit} />
                    </IconButton>
                  </Tooltip>}
                  <Tooltip title="Visualizar">
                    <IconButton href={doc.document} target="_blank" rel="noreferrer">
                      <Icon icon={baselineRemoveRedEye} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Exluir">
                    <IconButton onClick={() => deleteItem(doc)}>
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

DocumentsList.propTypes = {
  doc: PropTypes.array,
  seeDocument: PropTypes.func,
  deleteDocument: PropTypes.func,
};

export default DocumentsList;
