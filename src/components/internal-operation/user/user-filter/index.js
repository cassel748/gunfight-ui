import React from "react";
import PropTypes from "prop-types";
import { LoadingButton } from "@material-ui/lab";
import { Form, FormikProvider, useFormik } from "formik";
import { Box, Card, Stack, TextField, Typography } from "@material-ui/core";
import { MenuItem } from "@material-ui/core";

const UserFilter = ({ currentUser, onFilter }) => {
  const formik = useFormik({
    initialValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      accessLevel: currentUser?.accessLevel || "",
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

  const typeUser = [
    { title: "Marketing", value: 4 },
    { title: "Administrador", value: 3 },
    { title: "Comercial", value: 2 },
    { title: "Instrutor", value: 1 },
  ];

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
              <TextField fullWidth label="Nome" {...getFieldProps("name")} />
              <TextField fullWidth label="Email" {...getFieldProps("email")} />
              <TextField
                select
                fullWidth
                label="Tipo de Cliente"
                {...getFieldProps("accessLevel")}
              >
                {typeUser.map((option) => (
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

UserFilter.propTypes = {
  currentUser: PropTypes.object,
};

export default UserFilter;
