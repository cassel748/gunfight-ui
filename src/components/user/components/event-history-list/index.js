import React from "react";
import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
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
import { format } from "date-fns";
import { getDateLocalized } from "src/utils/localizedDateFns";

const EventHistoryList = ({ eventHistory, isLoading }) => {
  return (
    <Grid item xs={12}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width={"10%"} style={{ textAlign: "left" }}>
              #
            </TableCell>
            <TableCell widht={"70%"} style={{ textAlign: "left" }}>
              Evento
            </TableCell>
            <TableCell>Data / Hora</TableCell>
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

          {!isLoading && eventHistory.length === 0 && (
            <div
              style={{
                position: "absolute",
                fontSize: 18,
                padding: 58,
                width: "100%",
                textAlign: "center",
              }}
            >
              Nenhum histórico de evento encontrado :(
            </div>
          )}

          {!isLoading &&
            eventHistory.map((event, index) => (
              <TableRow key={index}>
                <TableCell style={{ textAlign: "left" }}>{index + 1}</TableCell>
                <TableCell style={{ textAlign: "left" }}>
                  {event.name}
                </TableCell>
                <TableCell>
                  {getDateLocalized(
                    new Date(event.createdAt),
                    "dd/MM/yyyy - hh:ss"
                  )}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Grid>
  );
};

EventHistoryList.propTypes = {
  eventHistory: PropTypes.array,
  isLoading: PropTypes.bool,
};

export default EventHistoryList;
