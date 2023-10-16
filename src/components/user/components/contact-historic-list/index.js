import React from "react";
import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
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
import { CONTACT_HISTORY_CHANNEL, CONTACT_HISTORY_REASONS, getEnumTitle } from "src/utils/enums";
import { getDateLocalized } from "src/utils/localizedDateFns";

const ContactHistoricList = ({ contactHistory, onViewItem, onDeleteItem, isLoading }) => {
  return (
    <Grid item xs={12}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width={10}>#</TableCell>
            <TableCell width={10}>Data</TableCell>
            <TableCell width={10}>Canal</TableCell>
            <TableCell width={10}>Contatado por</TableCell>
            <TableCell width={10}>Motivo</TableCell>
            <TableCell width={10}>Descrição</TableCell>
            <TableCell width={50} />
            <TableCell width={50} />
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

          {!isLoading && contactHistory.length === 0 && (
            <div
              style={{
                position: "absolute",
                fontSize: 18,
                padding: 58,
                width: "100%",
                textAlign: "center",
              }}
            >
              Nenhum histórico de contato cadastrado :(
            </div>
          )}

          {!isLoading &&
          contactHistory.map((contact, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{getDateLocalized(new Date(contact.date), "dd/MM/yyyy")}</TableCell>
              <TableCell>{getEnumTitle(CONTACT_HISTORY_CHANNEL, contact.channel)}</TableCell>
              <TableCell>{contact.sellerName ? contact.sellerName : "----"}</TableCell>
              <TableCell>{getEnumTitle(CONTACT_HISTORY_REASONS, contact.reason)}</TableCell>
              <TableCell>{contact.description.substring(0, 24)}{contact.description.length > 24 ? "..." : ""}</TableCell>

              <TableCell></TableCell>
              <TableCell>
                <Tooltip title="Visualizar">
                  <IconButton onClick={() => onViewItem(contact)}>
                    <Icon icon={baselineRemoveRedEye} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                  <IconButton onClick={() => onDeleteItem(contact)}>
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

ContactHistoricList.propTypes = {
  openView: PropTypes.func,
  deleteItem: PropTypes.func,
  contactHistory: PropTypes.array,
  isLoading: PropTypes.bool,
};

export default ContactHistoricList;
