import PropTypes from "prop-types";
import useStyles from "./styles";
import { toDate } from "date-fns";
import React, { useState } from "react";
import Card from "@material-ui/core/Card";
import { useSelector } from "react-redux";
import Iconify from "src/components/Iconify";
import { LoadingButton } from "@material-ui/lab";
import { formatCurrency } from "src/utils/string";
import eyeFill from "@iconify/icons-eva/eye-fill";
import { Grid, useTheme } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import CardContent from "@material-ui/core/CardContent";
import eyeOffFill from "@iconify/icons-eva/eye-off-fill";
import { LinkButton } from "src/components/Button/LinkButton";
import {
  getDateLocalized,
  differenceInDays,
  startOfToday,
} from "src/utils/localizedDateFns";
import { USER_TYPE } from "src/utils/auth";

const nextPaymentColors = {
  default: "#F23545",
  0: "#F4511E",
  "1-7": "#FDD835",
  "8-15": "#1E88E5",
  "16-30": "#4caf50",
};

const CommandDetail = ({ commands, finalizeCommand, type }) => {
  const classes = useStyles();
  const userInfo = useSelector((state) => state.user.userInfo);

  const [seeValue, setSeeValue] = useState(
    userInfo?.accessLevel === USER_TYPE.INSTRUCTOR ? false : true
  );

  const theme = useTheme();

  const getNextPaymentColor = (days) => {
    if (days < 0) return nextPaymentColors["default"];

    for (let range in nextPaymentColors) {
      var split = range.split("-");
      if (days >= parseInt(split[0]) && days <= parseInt(split[1] || split[0]))
        return nextPaymentColors[range];
    }
  };

  const isAssociates = (item) =>
    item === 1 || item === 4 || item === 6 || item === 8 || item === 9;

  const commandCard = (index, command, nextPayment, differenceDays) => (
    <Grid item xs={12} sm={6} md={3} p={1}>
      <Card key={index} className={classes.root} sx={{ p: 1 }}>
        <CardContent className={classes.cardContent}>
          <div
            className={
              isAssociates(command.internalUserType)
                ? classes.icon
                : classes.notAssociate
            }
          ></div>
          <Typography
            variant="h5"
            gutterBottom
            component="h3"
            ml={3}
            className={classes.number}
          >
            #{command.invoiceId}
          </Typography>

          <div className={classes.eye} onClick={() => setSeeValue(!seeValue)}>
            <Iconify
              icon={seeValue ? eyeFill : eyeOffFill}
              sx={{
                height: 25,
                width: 25,
                color: theme.palette.primary.light,
              }}
            />
          </div>

          <Typography variant="h4" component="h4" className={classes.name}>
            {command.associateNumber} - {command.associateName}
          </Typography>
          <Typography className={classes.value}>
            {seeValue
              ? formatCurrency(command.total - command.discount)
              : `R$ ${"\b"} ----------------`}
          </Typography>
        </CardContent>
        <CardContent sx={{ mt: -3 }} className={classes.button}>
          {nextPayment && differenceDays <= 30 && (
            <Typography
              color={getNextPaymentColor(differenceDays)}
              className={classes.nextPayment}
              sx={{ mb: 1 }}
            >
              {differenceDays < 0 && "Anuidade está vencida!"}
              {differenceDays == 0 && "Anuidade vence hoje!"}
              {differenceDays > 0 &&
                `Anuidade vence em ${differenceDays} dia(s)!`}{" "}
              <br />
              {getDateLocalized(nextPayment, "dd/MM/yyyy")}
            </Typography>
          )}
          <LinkButton
            fullWidth
            sx={{ mb: 1, mt: 1 }}
            loading={false}
            variant="outlined"
            href={`/actions/invoices/${command.docId}`}
          >
            Consumo
          </LinkButton>

          {command.status === 2 && (
            <LoadingButton
              fullWidth
              type="button"
              loading={false}
              variant="contained"
              onClick={() => finalizeCommand(command)}
            >
              Pagamento
            </LoadingButton>
          )}
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <>
      {commands
        .sort(function (a, b) {
          return new Date(b.associateName) - new Date(a.associateName);
        })
        .map((command, index) => {
          const nextPayment = command?.nextPayment
            ? toDate(new Date(command.nextPayment))
            : null;
          let differenceDays;

          if (nextPayment) {
            differenceDays = differenceInDays(nextPayment, startOfToday());
          }
          return commandCard(index, command, nextPayment, differenceDays);
        })}
    </>
  );
};

CommandDetail.propTypes = {
  finalizeCommand: PropTypes.func,
  commands: PropTypes.array.isRequired,
};

export default CommandDetail;
