import React, { useState } from "react";
import PropTypes from "prop-types";
import { LoadingButton } from "@material-ui/lab";
import InputDate from "src/components/InputDate";
import { Form, FormikProvider, useFormik } from "formik";
import { Icon } from "@iconify/react";
import {
  Card,
  Stack,
  MenuItem,
  TextField,
  Typography,
  Grid,
  IconButton,
} from "@material-ui/core";
import filterStyles from "src/components/Filter.module.css";
import baselineDelete from "@iconify/icons-ic/filter-list";
import MuiAccordion from "@material-ui/core/Accordion";
import MuiAccordionSummary from "@material-ui/core/AccordionSummary";
import MuiAccordionDetails from "@material-ui/core/AccordionDetails";
import { styled } from "@material-ui/styles";

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: 0,
  boxShadow: "none !important",
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
  root: {
    boxShadow: `none`,
  },
}));

const AccordionSummary = styled((props) => <MuiAccordionSummary {...props} />)(
  ({ theme }) => ({
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, .05)"
        : "rgba(0, 0, 0, .03)",
    flexDirection: "row-reverse",
    "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
      transform: "rotate(90deg)",
    },
    "& .MuiAccordionSummary-content": {
      marginLeft: theme.spacing(1),
    },
  })
);

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: "24px 0 0",
  borderTop: 0,
}));

const StartCommand = ({ currentUser, openStartCommand, onSearch, onClear }) => {
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const formik = useFormik({
    initialValues: {
      associete: currentUser?.associete || "",
      status: currentUser?.status || "",
      commnadDate: currentUser?.commnadDate || "",
      commandNumber: currentUser?.commandNumber || "",
    },
    onSubmit: (values) => {
      if (onSearch) {
        onSearch({
          status: values.status,
          date: values.commnadDate,
          invoiceId: values.commandNumber,
        });
      }
    },
  });

  const { getFieldProps } = formik;

  const statusList = [
    { title: "Em aberto", value: 1 },
    /* { title: "Finalizada", value: 2 }, */
    { title: "Paga", value: 3 },
  ];

  const handleFieldChange = (field, event) => {
    const value = event.target.value;
    formik.setFieldValue(field, value);
  };

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off">
        <Card sx={{ p: 3 }}>
          <Stack
            direction={{
              xs: "row",
              sm: "row",
              justifyContent: "space-between",
            }}
            spacing={{ xs: 3, sm: 2 }}
          >
            <Typography variant="h5" paragraph style={{ marginBottom: 0 }}>
              Comandas
              <IconButton
                style={{ marginLeft: 12 }}
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              >
                <Icon icon={baselineDelete} />
              </IconButton>
            </Typography>

            <LoadingButton
              type="button"
              variant="contained"
              loading={false}
              onClick={openStartCommand}
            >
              Iniciar Comanda
            </LoadingButton>
          </Stack>

          <Accordion
            TransitionProps={{ unmountOnExit: true }}
            expanded={isFilterExpanded}
          >
            <AccordionSummary
              style={{ height: 0, minHeight: 0 }}
            ></AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <InputDate
                    fullWidth
                    value=""
                    label="Data Comanda"
                    onChange={(event) =>
                      handleFieldChange("commnadDate", event)
                    }
                    value={formik.values.commnadDate}
                  />
                </Grid>

                <Grid item xs={6} md={3}>
                  <TextField
                    fullWidth
                    label="Número"
                    {...getFieldProps("commandNumber")}
                  />
                </Grid>

                <Grid item xs={6} md={3}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    {...getFieldProps("status")}
                  >
                    {statusList.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.title}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid
                  item
                  xs={6}
                  md={3}
                  className={filterStyles.filterButtonContainer}
                >
                  <LoadingButton
                    fullWidth
                    type="button"
                    loading={false}
                    onClick={() => {
                      formik.resetForm();
                      if (onClear) {
                        onClear();
                      }
                    }}
                    variant="outlined"
                    className={filterStyles.filterButton}
                  >
                    Limpar
                  </LoadingButton>

                  <LoadingButton
                    fullWidth
                    type="submit"
                    loading={false}
                    variant="contained"
                    className={filterStyles.filterButton}
                  >
                    Buscar
                  </LoadingButton>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Card>
      </Form>
    </FormikProvider>
  );
};

StartCommand.propTypes = {
  currentUser: PropTypes.object,
};

export default StartCommand;
