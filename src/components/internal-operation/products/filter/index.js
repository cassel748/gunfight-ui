import React from "react";
import PropTypes from "prop-types";
import { MenuItem } from "@material-ui/core";
import { LoadingButton } from "@material-ui/lab";
import { Form, FormikProvider, useFormik } from "formik";
import { Box, Card, Stack, TextField, Typography } from "@material-ui/core";
import { TYPE_PRODUCT, SITUATION_PRODUCT } from "src/utils/enums";

const ProductsFilter = ({ currentProduct, onFilter }) => {
  const formik = useFormik({
    initialValues: {
      title: currentProduct?.title || "",
      type: currentProduct?.type || "",
      situation: currentProduct?.situation || "",
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
              <TextField
                select
                fullWidth
                label="Status"
                {...getFieldProps("situation")}
              >
                {SITUATION_PRODUCT.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.title}
                  </MenuItem>
                ))}
              </TextField>
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

ProductsFilter.propTypes = {
  currentProduct: PropTypes.object,
};

export default ProductsFilter;
