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

  const [isLoadingPrint, setIsLoadingPrint] = useState(false)

  const onPrintHabituality = (index) => () => {
    const allItemHasArmamentNumber = eventHistory[index]?.products?.filter((product) => {
      return !product.armamentNumber || product.armamentNumber === "" || product.armamentNumber === null;
    }).length === 0;

    // caso todos produtos possuam gunDetail preenchidos, imprimir PDF
    if (allItemHasArmamentNumber) {
      printDeclaration()
      return;
    }

    // Caso algum produto tenha o gunDetail faltando:
    // Abrir a modal para preencher
    // Modal deve conter a lista de produtos com um campo de gunDetail para cada produto
    alert("Abrir modal")
  };

  const onEditGunDetail = (index) => () => {
    // Abrir a modal para editar a lista de gunDetail dos produtos
  };

  async function printDeclaration(data = {}, method = "GET") {
    try {
      setIsLoadingPrint(true);
      await printFile(
        `/api/associate/declaration/habituality/${id}`,
        data,
        "pdf",
        null,
        method
      );
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoadingPrint(false);
    }
  };

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
            <TableCell width={"20%"}></TableCell>
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
              const allItemHasArmamentNumber = eventHistory[index]?.products?.filter((product) => {
                return !product.armamentNumber || product.armamentNumber === "" || product.armamentNumber === null;
              }).length === 0;

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
                <TableCell style={{ maxWidth: "150px" }}>
                  <div style={{ display: 'flex'}}>
                    <LoadingButton
                      fullWidth
                      type="button"
                      size="small"
                      variant="text"
                      onClick={onPrintHabituality(index)}
                      loading={isLoadingPrint}
                    >
                      Imprimir
                    </LoadingButton>
                    {allItemHasArmamentNumber && (
                      <LoadingButton
                        fullWidth
                        type="button"
                        size="small"
                        variant="contained"
                        onClick={onEditGunDetail(index)}
                        loading={isLoadingPrint}
                      >
                        Editar
                      </LoadingButton>
                    )}
                  </div>
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
