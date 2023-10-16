import React from "react";
import { LoadingButton } from "@material-ui/lab";
import { Form, FormikProvider, useFormik } from "formik";
import {
  Box,
  Card,
  Stack,
  MenuItem,
  TextField,
  Typography,
} from "@material-ui/core";

const DocsPack = ({ currentUser }) => {
  const formik = useFormik({
    initialValues: {
      routine: currentUser?.routine || "",
    },
    onSubmit: async () => {},
  });

  const requests = [
    { title: "EB - Pedido de CR", value: 1 },
    { title: "EB - Autorização de Compra", value: 2 },
    { title: "EB - CRAF", value: 3 },
    { title: "EB - Guia de Tráfego", value: 4 },
    { title: "PF - Autorização de Compra", value: 5 },
    { title: "PF - Posse", value: 6 },
    { title: "PF - Porte", value: 7 },
    { title: "PF - Guia de Tráfego", value: 8 },
  ];

  const { handleSubmit, isSubmitting, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Card sx={{ p: 3, minHeight: 400 }}>
          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-start" }}>
            <Typography variant="h5" paragraph>
              Pacote de Documentos
            </Typography>
          </Box>

          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField
                select
                fullWidth
                label="Rotina"
                {...getFieldProps("routine")}
              >
                {requests.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.title}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <LoadingButton
              fullWidth
              type="button"
              variant="contained"
              loading={isSubmitting}
            >
              Gerar Pacote
            </LoadingButton>
          </Stack>
        </Card>
      </Form>
    </FormikProvider>
  );
};

export default DocsPack;
