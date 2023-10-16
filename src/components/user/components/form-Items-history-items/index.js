import React, { useState } from "react";
import * as Yup from "yup";
import PropTypes from "prop-types";
import InputDate from "src/components/InputDate";
import { LoadingButton } from "@material-ui/lab";
import { Form, FormikProvider, useFormik } from "formik";
import {
  Box,
  Card,
  Stack,
  TextField,
  Typography,
} from "@material-ui/core";
import { useAuthUser } from "next-firebase-auth";
import { useSelector } from "react-redux";
import Toast from "src/utils/toast";
import InputCurrency from "src/components/InputCurrency";

const FormAddHistoryItem = ({ currentContactHistory, handleClose, userId }) => {
  const AuthUser = useAuthUser();
  const userInfo = useSelector(state => state.user.userInfo);
  const [user, setUser] = useState({});

  const UserAddressSchema = Yup.object().shape({
    date: Yup.string().required("Data de consumo obrigatória"),
    item: Yup.string().required("Item obrigatório"),
    commandNumber: Yup.string().max(4, "Máximo 4 números"),
    quantity: Yup.number().required("Quantidade obrigatória"),
    unitValue: Yup.number(),
    discount: Yup.number(),
    total: Yup.number(),
  });

  const formik = useFormik({
    initialValues: {
      date: currentContactHistory?.date || "",
      item: currentContactHistory?.item || "",
      commandNumber: currentContactHistory?.commandNumber || "",
      quantity: currentContactHistory?.quantity || "",
      unitValue: currentContactHistory?.unitValue || "",
      discount: currentContactHistory?.discount || "",
      total: currentContactHistory?.total || "",
    },

    validationSchema: UserAddressSchema,
    onSubmit: async (values) => {
      try {
        const token = await AuthUser.getIdToken();
        const response = await fetch("/api/associate/item-associate-history", {
          method: "POST",
          body: JSON.stringify({
            ...values,
            createdBy: userInfo.id,
            associateId: userId,
            total: values.unitValue * values.quantity - values.discount
          }),
          headers: {
            Authorization: token
          }
        });

        const data = await response.json();

        if (data && data.success) {
          Toast.success("Item cadastrado com sucesso!");
          handleClose(true);
        }
      } catch (e) {
        console.log(e);
      }
    },
  });


  const handleFieldChange = (field, event) => {
    const value = event.target.value;
    formik.setFieldValue(field, value)
  };

  const { errors, touched, isSubmitting, getFieldProps } = formik;

  const onSelectUser = user => {
    setUser(user);
  };

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off">
        <Card sx={{ p: 3 }}>
          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-start" }}>
            <Typography variant="h5" paragraph>
              Novo item para histórico
            </Typography>
          </Box>

          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <InputDate
                label="Data do consumo"
                {...getFieldProps("date")}
                onChange={event => handleFieldChange('date', event)}
                error={Boolean(touched.date && errors.date)}
                helperText={touched.date && errors.date}
              />
              <TextField
                label="Item"
                fullWidth
                {...getFieldProps("item")}
                error={Boolean(touched.item && errors.item)}
                helperText={touched.item && errors.item}
              />

            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField
                label="N Comanda"
                fullWidth
                {...getFieldProps("commandNumber")}
                error={Boolean(touched.commandNumber && errors.commandNumber)}
                helperText={touched.commandNumber && errors.commandNumber}
              />
              <TextField
                label="Quantidade"
                fullWidth
                {...getFieldProps("quantity")}
                error={Boolean(touched.quantity && errors.quantity)}
                helperText={touched.quantity && errors.quantity}
              />


            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >

              <InputCurrency
                label="Valor Unitário"
                fullWidth
                {...getFieldProps("unitValue")}
                error={Boolean(touched.unitValue && errors.unitValue)}
                helperText={touched.unitValue && errors.unitValue}
              />

              <InputCurrency
                label="Desconto"
                fullWidth
                {...getFieldProps("discount")}
                error={Boolean(touched.discount && errors.discount)}
                helperText={touched.discount && errors.discount}
              />
              {/* <TextField
                fullWidth
                disabled
                label="Total"
                {...getFieldProps("total")}
                error={Boolean(touched.total && errors.total)}
                helperText={touched.total && errors.total}
              /> */}



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
                type="button"
                variant="outlined"
                onClick={handleClose}
              >
                Fechar
              </LoadingButton>

              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                Salvar
              </LoadingButton>
            </Stack>
          </Stack>
        </Card>
      </Form>
    </FormikProvider>
  );
};

FormAddHistoryItem.propTypes = {
  currentUser: PropTypes.object,
  handleClose: PropTypes.func,
};

export default FormAddHistoryItem;
