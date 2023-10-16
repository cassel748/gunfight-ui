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
import NextLink from "src/components/Button/Link";

const ListEvents = ({ events, deleteEvent, isLoading }) => {
  return (
    <Card sx={{ mt: 5 }} style={{ minHeight: 500 }}>
      <TableContainer sx={{ minWidth: 800 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Data Inicial</TableCell>
              <TableCell>Data Final</TableCell>
              <TableCell width={"25%"}>Descrição</TableCell>
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
                Carregando eventos...
              </div>
            )}

            {!isLoading && events.length === 0 && (
              <div
                style={{
                  position: "absolute",
                  fontSize: 18,
                  padding: 58,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                Nenhum evento cadastrado :(
              </div>
            )}

            {!isLoading &&
              events.map((event, index) => (
                <TableRow key={index} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{getDateLocalized(new Date(event.startDate), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell>{getDateLocalized(new Date(event.endDate), "dd/MM/yyyy HH:mm")}</TableCell>

                  <TableCell>
                    {event.description.length > 25
                      ? event.description.substring(0, 25) + " ..."
                      : event.description}
                  </TableCell>

                  <TableCell>
                    <Tooltip title="Editar">
                      <NextLink href={`/internal/events/${event.docId}`} passHref>
                        <IconButton>
                          <Icon icon={baselineEdit} />
                        </IconButton>
                      </NextLink>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Excluir">
                      <IconButton onClick={() => deleteEvent(event)}>
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

ListEvents.propTypes = {
  deleteEvent: PropTypes.func,
  events: PropTypes.array.isRequired,
};

export default ListEvents;
