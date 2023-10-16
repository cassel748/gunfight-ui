import React from "react";
import PropTypes from "prop-types";
import {
  Grid,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Typography,
} from "@material-ui/core";
import { CircularProgress } from "@material-ui/core";
import { formatCurrency } from "src/utils/string";
import { LinkButton } from "src/components/Button/LinkButton";
import { getDateLocalized } from "src/utils/localizedDateFns";

const InvoiceHistoryList = ({ invoiceHistory, isLoading }) => {
  const itemsDiscount = invoiceHistory
    .filter((item) => item.total - item.discount !== undefined)
    .map((item) => item.total)
    .reduce((prev, curr) => prev + curr, 0);

  return (
    <Grid item xs={12}>
      <Typography
        variant="h6"
        style={{ textAlign: "right", margin: 10, marginTop: 0 }}
      >
        Total: {formatCurrency(itemsDiscount)}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width={10}>Data abertura</TableCell>
            <TableCell width={"10%"}>Número Comanda</TableCell>
            <TableCell width={10}>Vendedor</TableCell>
            <TableCell width={10}>Desconto Pagamento</TableCell>
            <TableCell width={10}>Subtotal</TableCell>
            <TableCell width={10}>Total(Com descontos)</TableCell>
            <TableCell width={"10%"} />
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

          {!isLoading && invoiceHistory.length === 0 && (
            <div
              style={{
                position: "absolute",
                fontSize: 18,
                padding: 58,
                width: "100%",
                textAlign: "center",
              }}
            >
              Nenhum histórico de comanda encontrado :(
            </div>
          )}

          {!isLoading &&
            invoiceHistory.map((invoice, index) => (
              <TableRow key={index}>
                <TableCell>
                  {getDateLocalized(new Date(invoice.createdAt), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>{invoice.invoiceId}</TableCell>
                <TableCell>{invoice.sellerName}</TableCell>
                <TableCell>{formatCurrency(invoice.paymentDiscount)}</TableCell>
                <TableCell>
                  <strong>
                    {formatCurrency(invoice.subtotal + invoice.discount)}
                  </strong>
                </TableCell>
                <TableCell>
                  <strong>{formatCurrency(invoice.total)}</strong>
                </TableCell>

                <TableCell>
                  <LinkButton
                    fullWidth
                    size="small"
                    loading={false}
                    variant="text"
                    href={`/actions/invoices/${invoice.docId}`}
                    target="_blank"
                  >
                    Visualizar
                  </LinkButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Grid>
  );
};

InvoiceHistoryList.propTypes = {
  invoiceHistory: PropTypes.array,
  isLoading: PropTypes.bool,
};

export default InvoiceHistoryList;
