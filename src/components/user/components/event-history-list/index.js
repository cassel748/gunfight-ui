import {
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@material-ui/core";
import { LoadingButton } from "@material-ui/lab";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useState } from "react";
import { printFile } from "src/utils/file";
import { getDateLocalized } from "src/utils/localizedDateFns";

const EventHistoryList = ({ eventHistory, isLoading }) => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Grid item xs={12}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width={"5%"} style={{ textAlign: "left" }}>
              #
            </TableCell>
            <TableCell width={"65%"} style={{ textAlign: "left" }}>
              Evento
            </TableCell>
            <TableCell width={"10%"}>Data / Hora</TableCell>
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
            eventHistory.map((event, index) => {
              return (
              <TableRow key={index}>
                <TableCell style={{ textAlign: "left" }}>{index + 1}</TableCell>
                <TableCell style={{ textAlign: "left" }}>
                  {event.name}
                </TableCell>
                <TableCell>
                  {getDateLocalized(
                    new Date(event.createdAt),
                    "dd/MM/yyyy - hh:mm"
                  )}
                </TableCell>
              </TableRow>
              )
            })}
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
