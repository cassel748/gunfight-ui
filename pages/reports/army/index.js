import React, { useState } from "react";
import { LoadingButton } from "@material-ui/lab";
import InputDate from "src/components/InputDate";
import { Form, FormikProvider, useFormik } from "formik";
import { Grid, Card, Typography } from "@material-ui/core";
import * as Yup from "yup";

export default function ArmyFilter({ currentReports, onSearch }) {
  const ReportSchema = Yup.object().shape({
    initialDate: Yup.string().required("Data Inicial obrigatória"),
    endDate: Yup.string().required("Data Final obrigatória"),
  });

  const formik = useFormik({
    initialValues: {
      initialDate: currentReports?.initialDate || "",
      endDate: currentReports?.endDate || "",
    },
    validationSchema: ReportSchema,
    onSubmit: (values) => {
      if (onSearch) {
        onSearch({
          initialDate: values.initialDate,
          endDate: values.endDate,
        });
      }
    },
  });

  const { errors, touched } = formik;

  const handleFieldChange = (field, event) => {
    const value = event.target.value;
    formik.setFieldValue(field, value);
  };

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off">
        <Card sx={{ p: 3 }}>
          <Grid spacing={{ xs: 3, sm: 2 }}>
            <Typography variant="h5" paragraph>
              Demonstrativo de saída de munições
            </Typography>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <InputDate
                fullWidth
                label="Data Inicial"
                onChange={(event) => handleFieldChange("initialDate", event)}
                value={formik.values.initialDate}
                error={Boolean(touched.initialDate && errors.initialDate)}
                helperText={touched.initialDate && errors.initialDate}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <InputDate
                fullWidth
                label="Data Final"
                onChange={(event) => handleFieldChange("endDate", event)}
                value={formik.values.endDate}
                error={Boolean(touched.endDate && errors.endDate)}
                helperText={touched.endDate && errors.endDate}
              />
            </Grid>

            <Grid item xs={12} sm={2} />

            <Grid item xs={12} sm={2}>
              <LoadingButton
                fullWidth
                type="submit"
                loading={false}
                variant="contained"
                style={{ height: 44 }}
              >
                Gerar
              </LoadingButton>
            </Grid>
          </Grid>
        </Card>
      </Form>
    </FormikProvider>
  );
}
