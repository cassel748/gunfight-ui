import React, { useState } from "react";
import PropTypes from "prop-types";
import NextLink from "src/components/Button/Link";
import { LoadingButton } from "@material-ui/lab";
import { formatCurrency } from "src/utils/string";
import { getDateLocalized } from "src/utils/localizedDateFns";
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  TableContainer,
  CircularProgress,
} from "@material-ui/core";
import { printFile } from "src/utils/file";
import { LinkButton } from "src/components/Button/LinkButton";

const CommandCompleted = ({ isLoading, commands }) => {
  const [localInvoices, setLocalInvoices] = useState(commands);

  const setItemLoading = (state, index) => {
    let newArr = [...localInvoices];
    newArr[index].isLoadingPrint = state;

    setLocalInvoices(newArr);
  };

  const print = (docId, index) => async () => {
    try {
      setItemLoading(true, index);
      await printFile(`/api/invoice/print/${docId}`, {});
    } catch (e) {
      console.log(e);
    } finally {
      setItemLoading(false, index);
    }
  };

  return (
    <TableContainer sx={{ minHeight: 350 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width={"15%"}>Finalizada em</TableCell>
            <TableCell width={"17%"}>
              <span style={{ display: "block", textAlign: "center" }}>
                Associado
              </span>
            </TableCell>
            <TableCell width={"13%"}>Número comanda</TableCell>
            <TableCell width={"7%"}>Data abertura</TableCell>
            <TableCell width={"7%"}>Iniciada por</TableCell>
            <TableCell width={"7%"}>Subtotal</TableCell>
            <TableCell width={"7%"}>Total</TableCell>
            <TableCell width={"7%"} />
            <TableCell width={"7%"} />
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading && (
            <div
              style={{
                padding: 58,
                width: "100%",
                fontSize: 18,
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

          {!isLoading && commands.length === 0 && (
            <div
              style={{
                fontSize: 18,
                padding: 58,
                width: "100%",
                textAlign: "center",
                position: "absolute",
              }}
            >
              Nenhuma comanda paga :(
            </div>
          )}

          {!isLoading &&
            localInvoices.map((consumables, index) => {
              return (
                <TableRow key={index}>
                  <TableCell>
                    {getDateLocalized(
                      new Date(consumables.finishedAt),
                      "dd/MM/yyyy"
                    )}
                  </TableCell>
                  <TableCell>
                    <NextLink
                      href={`/associates/register/${consumables.associateId}`}
                    >
                      <span
                        style={{
                          display: "block",
                          textAlign: "left",
                          color: "#FF7272",
                          cursor: "pointer",
                        }}
                      >
                        {consumables.associateNumber} -{" "}
                        {consumables.associateName}
                      </span>
                    </NextLink>
                  </TableCell>
                  <TableCell>{consumables.invoiceId}</TableCell>
                  <TableCell>
                    {getDateLocalized(
                      new Date(consumables.createdAt),
                      "dd/MM/yyyy"
                    )}
                  </TableCell>
                  <TableCell>{consumables.sellerName}</TableCell>

                  <TableCell>{formatCurrency(consumables.subtotal)}</TableCell>

                  <TableCell>{formatCurrency(consumables.total)}</TableCell>
                  <TableCell>
                    <LoadingButton
                      fullWidth
                      type="button"
                      size="small"
                      loading={consumables.isLoadingPrint}
                      variant="text"
                      target="_blank"
                      onClick={print(consumables.docId, index)}
                    >
                      Imprimir
                    </LoadingButton>
                  </TableCell>
                  <TableCell>
                    <LinkButton
                      fullWidth
                      size="small"
                      loading={false}
                      variant="text"
                      href={`/actions/invoices/${consumables.docId}`}
                    >
                      Visualizar
                    </LinkButton>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

CommandCompleted.propTypes = {
  commmandList: PropTypes.array,
};

export default CommandCompleted;
