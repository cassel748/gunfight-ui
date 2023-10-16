import React, { useState } from "react";
import * as Yup from "yup";
import { TYPE_PRODUCT } from "src/utils/enums";
import { addDays } from "src/utils/localizedDateFns";
import { LoadingButton } from "@material-ui/lab";
import InputDate from "src/components/InputDate";
import { Form, FormikProvider, useFormik } from "formik";
import UserAutocomplete from "src/components/UserAutocomplete";
import ProductAutocomplete from "src/components/ProductAutocomplete";
import { Grid, Card, Typography, TextField, MenuItem } from "@material-ui/core";

export default function CommandsFilter({
  currentReports,
  onSearch,
  onSearchExcel,
  onSearchNumbers,
}) {
  const [user, setUser] = useState({});
  const [excel, setExcel] = useState(false);
  const [product, setProduct] = useState({});
  const [numbers, setNumbers] = useState(false);
  const [type, setType] = useState(0);

  const ReportSchema = Yup.object().shape({
    initialDate: Yup.date().required("Data Inicial obrigatória"),
    endDate: Yup.date()
      .min(
        Yup.ref("initialDate"),
        "A data final deve ser maior que a data inicial!"
      )
      // .when('initialDate', (initialDate, schema) => {
      //   if (initialDate) {
      //     let limitDate = addDays(initialDate, 31);
      //     return schema.max(limitDate, 'A data final deve ser no máximo 31 dias!');
      //   } else {
      //     return schema;
      //   }
      // })
      .required("Data Final obrigatória"),
  });

  const formik = useFormik({
    initialValues: {
      type: currentReports?.type || "",
      endDate: currentReports?.endDate || "",
      sellerId: currentReports?.sellerId || "",
      productId: currentReports?.productId || "",
      initialDate: currentReports?.initialDate || "",
    },
    validationSchema: ReportSchema,
    onSubmit: (values) => {
      if (numbers) {
        onSearchNumbers({
          type: values.type,
          endDate: values.endDate,
          sellerId: values.sellerId,
          productId: values.productId,
          initialDate: values.initialDate,
        });
      } else if (excel) {
        onSearchExcel({
          type: values.type,
          endDate: values.endDate,
          sellerId: values.sellerId,
          productId: values.productId,
          initialDate: values.initialDate,
          pfOreb: type,
        });
      } else {
        onSearch({
          type: values.type,
          endDate: values.endDate,
          sellerId: values.sellerId,
          productId: values.productId,
          initialDate: values.initialDate,
          pfOreb: type,
        });
      }
    },
  });

  const { errors, touched } = formik;

  const handleFieldChange = (field, event) => {
    const value = event.target.value;
    formik.setFieldValue(field, value);
  };

  const onSelectUser = (user) => {
    setUser(user);
  };

  const onSelectProduct = (product) => {
    setProduct(product);
  };

  const { getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off">
        <Card sx={{ p: 3 }}>
          <Grid
            spacing={{ xs: 3, sm: 2 }}
            direction="row"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h5" paragraph width="400px">
              Relatório de Comandas
            </Typography>
            <LoadingButton
              variant="outline"
              loading={false}
              onClick={() => {
                formik.resetForm();
              }}
              style={{ height: 44, color: "#F23545" }}
            >
              Limpar Formulário
            </LoadingButton>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <ProductAutocomplete
                fullWidth
                label="Produto"
                multiple={true}
                onSelect={onSelectProduct}
                helperText={touched.productId && errors.productId}
                error={Boolean(touched.productId && errors.productId)}
                onChange={(event) => handleFieldChange("productId", event)}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <UserAutocomplete
                fullWidth
                label="Vendedor"
                showMeButton={false}
                onSelect={onSelectUser}
                helperText={touched.sellerId && errors.sellerId}
                error={Boolean(touched.sellerId && errors.sellerId)}
                onChange={(event) => handleFieldChange("sellerId", event)}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Tipo"
                {...getFieldProps("type")}
              >
                {TYPE_PRODUCT.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    onClick={() => {
                      setType(option.value);
                    }}
                  >
                    {option.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={3}>
              <InputDate
                fullWidth
                label="Data Inicial"
                value={formik.values.initialDate}
                helperText={touched.initialDate && errors.initialDate}
                error={Boolean(touched.initialDate && errors.initialDate)}
                onChange={(event) => handleFieldChange("initialDate", event)}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <InputDate
                fullWidth
                label="Data Final"
                value={formik.values.endDate}
                helperText={touched.endDate && errors.endDate}
                error={Boolean(touched.endDate && errors.endDate)}
                onChange={(event) => handleFieldChange("endDate", event)}
              />
            </Grid>
            {type === 14 || type === 15 ? (
              <Grid item xs={12} sm={3}></Grid>
            ) : (
              <Grid item xs={12} sm={3}>
                <LoadingButton
                  fullWidth
                  type="submit"
                  onClick={() => {
                    setNumbers(false);
                    setExcel(true);
                  }}
                  loading={false}
                  variant="contained"
                  style={{ height: 44 }}
                >
                  Gerar Excel
                </LoadingButton>
              </Grid>
            )}
            <Grid item xs={12} sm={3}>
              <LoadingButton
                fullWidth
                type="submit"
                onClick={() => {
                  setNumbers(false);
                  setExcel(false);
                }}
                loading={false}
                variant="contained"
                style={{ height: 44 }}
              >
                {type === 14 || type === 15 ? "Gerar Excel" : "Gerar PDF"}
              </LoadingButton>
            </Grid>
          </Grid>
        </Card>
      </Form>
    </FormikProvider>
  );
}
