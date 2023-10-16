import React from "react";
import PropTypes from "prop-types";
import { MenuItem } from "@material-ui/core";
import { LoadingButton } from "@material-ui/lab";
import { Form, FormikProvider, useFormik } from "formik";
import { Box, Card, Stack, TextField, Typography } from "@material-ui/core";

const WeaponsFilter = ({ currentWeapon, onFilter }) => {
  const formik = useFormik({
    initialValues: {
      model: currentWeapon?.model || "",
      brand: currentWeapon?.brand || "",
      caliber: currentWeapon?.caliber || "",
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
          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-start" }}>
            <Typography variant="h5" paragraph>
              Filtros
            </Typography>
          </Box>
          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField fullWidth label="Modelo" {...getFieldProps("model")} />
              <TextField fullWidth label="Marca" {...getFieldProps("brand")} />
              <TextField
                fullWidth
                label="Calibre"
                {...getFieldProps("caliber")}
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

WeaponsFilter.propTypes = {
  currentWeapon: PropTypes.object,
};

export default WeaponsFilter;
