import React from "react";
import PropTypes from "prop-types";
import { LoadingButton } from "@material-ui/lab";
import { Form, FormikProvider, useFormik } from "formik";
import { Box, Card, Stack, TextField, Typography } from "@material-ui/core";
import InputDate from "src/components/InputDate";

const EventsFilter = ({ currentEvent, onFilter }) => {
  const formik = useFormik({
    initialValues: {
      title: currentEvent?.title || "",
      startDate: currentEvent?.startDate || "",
      endDate: currentEvent?.endDate || "",
    },
    onSubmit: (values) => {
      onFilter(values);
    },
  });

  const clearFilter = () => {
    formik.resetForm();
    onFilter();
  };

  const { getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off">
        <Card sx={{ p: 3 }}>
          <Box
            sx={{
              mt: 1,
              display: "flex",
              justifyContent: "flex-start",
              marginBottom: 2,
            }}
          >
            <Typography variant="h5" paragraph>
              Filtros
            </Typography>
          </Box>
          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField fullWidth label="Título" {...getFieldProps("title")} />
              <InputDate
                fullWidth
                label="Data de início"
                {...getFieldProps("startDate")}
                value={formik.values.startDate}
              />
              <InputDate
                fullWidth
                label="Data final"
                {...getFieldProps("endDate")}
                value={formik.values.endDate}
              />
            </Stack>
            <Stack
              direction={{
                xs: "column",
                sm: "row",
                justifyContent: "flex-end",
              }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <LoadingButton
                loading={false}
                onClick={clearFilter}
                variant="outlined"
              >
                Limpar Filtros
              </LoadingButton>
              <></>
              <LoadingButton type="submit" variant="contained" loading={false}>
                Aplicar Filtros
              </LoadingButton>
            </Stack>
          </Stack>
        </Card>
      </Form>
    </FormikProvider>
  );
};

EventsFilter.propTypes = {
  currentEvent: PropTypes.object,
};

export default EventsFilter;
