import * as Yup from "yup";
import React, { useState } from "react";
import { TYPE_PRODUCT } from "src/utils/enums";
import { LoadingButton } from "@material-ui/lab";
import InputDate from "src/components/InputDate";
import { Form, FormikProvider, useFormik } from "formik";
import ProductAutocomplete from "src/components/ProductAutocomplete";
import { Grid, Card, Typography, TextField, MenuItem } from "@material-ui/core";

export default function MarketingFilter({ currentReports, onSearch }) {
  const [user, setUser] = useState({});
  const [product, setProduct] = useState({});

  const ReportSchema = Yup.object().shape({
    initialDate: Yup.string().required("Data Inicial obrigatória"),
    endDate: Yup.string().required("Data Final obrigatória"),
  });

  const formik = useFormik({
    initialValues: {
      type: currentReports?.type || "",
      endDate: currentReports?.endDate || "",
      productId: currentReports?.productId || "",
      initialDate: currentReports?.initialDate || "",
    },
    validationSchema: ReportSchema,
    onSubmit: (values) => {
      if (onSearch) {
        onSearch({
          //seller: user,
          type: values.type,
          endDate: values.endDate,
          productId: values.productId,
          initialDate: values.initialDate,
        });
      }
    },
  });

  const { errors, touched } = formik;

  const handleFieldChange = (field, event) => {
    const value = event.target.value;
    formik.setFieldValue(field, value);
  };

  const onSelectProduct = (product) => {
    setProduct(product);
  };

  const { getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off">
        <Card sx={{ p: 3 }}>
          <Grid spacing={{ xs: 3, sm: 2 }}>
            <Typography variant="h5" paragraph>
              Relatório de Marketing
            </Typography>
          </Grid>

          <Grid container spacing={2}>
            {/* <Grid item xs={12} sm={4}>
              <ProductAutocomplete
                fullWidth
                label="Produto"
                onSelect={onSelectProduct}
                helperText={touched.productId && errors.productId}
                error={Boolean(touched.productId && errors.productId)}
                onChange={(event) => handleFieldChange("productId", event)}
              />
            </Grid> */}

            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Tipo"
                {...getFieldProps("type")}
              >
                {TYPE_PRODUCT.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={2}>
              <InputDate
                fullWidth
                label="Data Inicial"
                value={formik.values.initialDate}
                helperText={touched.initialDate && errors.initialDate}
                error={Boolean(touched.initialDate && errors.initialDate)}
                onChange={(event) => handleFieldChange("initialDate", event)}
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <InputDate
                fullWidth
                label="Data Final"
                value={formik.values.endDate}
                helperText={touched.endDate && errors.endDate}
                error={Boolean(touched.endDate && errors.endDate)}
                onChange={(event) => handleFieldChange("endDate", event)}
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
