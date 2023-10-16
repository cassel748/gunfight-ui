import React from "react";
import PropTypes from "prop-types";
import { LoadingButton } from "@material-ui/lab";
import { Form, FormikProvider, useFormik } from "formik";
import { Box, Card, Stack, TextField, Typography } from "@material-ui/core";
import InputCpf from "src/components/InputCpf";
import { MenuItem } from "@material-ui/core";
import { INTERNAL_USER_TYPE, USER_STATUS } from "src/utils/enums";
import InputCellphone from "src/components/InputCellphone";

const AssociatesFilter = ({ currentUser, onFilter }) => {
  const formik = useFormik({
    initialValues: {
      name: currentUser?.name || "",
      phoneNumber: currentUser?.phoneNumber || "",
      internalUserType: currentUser?.internalUserType || "",
      cpf: currentUser?.cpf || "",
      active: currentUser?.active || "",
      spouseName: currentUser?.spouseName || "",
    },
    onSubmit: (values) => {
      onFilter(values);
    },
  });

  const clearFilter = () => {
    formik.resetForm();
    onFilter();
  };

  const { handleSubmit, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
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
              <TextField
                select
                fullWidth
                label="Tipo do cliente"
                {...getFieldProps("internalUserType")}
              >
                {INTERNAL_USER_TYPE.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.title}
                  </MenuItem>
                ))}
              </TextField>
              <InputCpf label="CPF" {...getFieldProps("cpf")} />
              <TextField
                select
                fullWidth
                label="Status"
                {...getFieldProps("active")}
              >
                {USER_STATUS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.title}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField
                fullWidth
                label="Cônjuge"
                {...getFieldProps("spouseName")}
              />
              <InputCellphone
                fullWidth
                label="Celular"
                {...getFieldProps("phoneNumber")}
              />

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                  justifyContent: "flex-end",
                }}
                spacing={{ xs: 3, sm: 2 }}
                width="100%"
              >
                <LoadingButton
                  type="button"
                  loading={false}
                  onClick={clearFilter}
                  variant="outlined"
                >
                  Limpar Filtros
                </LoadingButton>
                <></>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={false}
                >
                  Aplicar Filtros
                </LoadingButton>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      </Form>
    </FormikProvider>
  );
};

AssociatesFilter.propTypes = {
  currentUser: PropTypes.object,
};

export default AssociatesFilter;
