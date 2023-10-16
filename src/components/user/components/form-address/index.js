import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import PropTypes from "prop-types";
import countries from "src/utils/countries";
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
import InputMask from "react-input-mask";
import { removeMask } from "src/utils/string";
import Toast from "src/utils/toast";
import { useSelector } from "react-redux";
import { useAuthUser } from "next-firebase-auth";
import { ADDRESS_TYPE, getAddressColor } from "src/utils/enums";
import Label from "src/components/Label";

const FormAddress = ({ currentAddress, handleClose, userId }) => {
  const AuthUser = useAuthUser();
  const userInfo = useSelector(state => state.user.userInfo);
  const UserAddressSchema = Yup.object().shape({
    address: Yup.string().required("Nome da Rua é obrigatório"),
    complement: Yup.string(),
    number: Yup.string().required("Número é obrigatório"),
    city: Yup.string().required("Cidade é obrigatório"),
    country: Yup.string().required("País é obrigatório"),
    zipCode: Yup.string().required("Código Postal é obrigatório"),
    state: Yup.string().required("Estado é obrigatório"),
    type: Yup.string().required("Tipo é obrigatório"),
    neighborhood: Yup.string().required("Bairro é obrigatório")
  });

  const formik = useFormik({
    initialValues: {
      address: currentAddress?.address || "",
      number: currentAddress?.number || "",
      complement: currentAddress?.complement || "",
      city: currentAddress?.city || "",
      state: currentAddress?.state || "",
      zipCode: currentAddress?.zipCode || "",
      country: currentAddress?.country || "",
      type: currentAddress?.type || "",
      neighborhood: currentAddress?.neighborhood || "",
    },
    validationSchema: UserAddressSchema,
    onSubmit: async (values) => { 
      try {
        if (currentAddress?.associateId) {
          return handleUpdateAddress(values);
        }

        const token = await AuthUser.getIdToken();
        const response = await fetch("/api/associate/address", {
          method: "POST",
          body: JSON.stringify({
            ...values,
            associateId: userId,
            createdBy: userInfo.id,
          }),
          headers: {
            Authorization: token
          }
        });

        const data = await response.json();

        if (data && data.success) {
          Toast.success("Endereço cadastrado com sucesso!");
          handleClose(true);
        }
      } catch (err) {
        console.log(err);
      }
    },
  });

  const { errors, touched, isSubmitting, getFieldProps } = formik;

  const handleUpdateAddress = async (values) => {
    try {
      const token = await AuthUser.getIdToken();
      const response = await fetch("/api/associate/address", {
        method: "PUT",
        body: JSON.stringify({
          ...values,
          modifiedBy: userInfo.id,
          docId: currentAddress?.docId,
        }),
        headers: {
          Authorization: token
        }
      });

      const data = await response.json();

      if (data && data.success) {
        Toast.success("Endereço alterado com sucesso!");
        handleClose(true);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleChangeCep = async (event) => {
    const value = event.target.value;
    formik.setFieldValue('zipCode', value);

    if (value && value.indexOf('_') > -1) {
      return;
    }

    const valueFormatted = removeMask(value);
    const url = `https://viacep.com.br/ws/${valueFormatted}/json/`;
    const response = await fetch(url, {
      method: "GET",
    });

    const data = await response.json()

    if (data && data.erro) {
      const message = "CEP não encontrado :(";
      return Toast.error(message);
    }

    formik.setFieldValue('address', data.logradouro);
    formik.setFieldValue('state', data.uf);
    formik.setFieldValue('neighborhood', data.bairro);
    formik.setFieldValue('city', data.localidade);
    formik.setFieldValue('country', 'Brasil');
  }

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off">
        <Card sx={{ p: 3 }}>
          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-start" }}>
            <Typography variant="h5" paragraph>
              Criar endereço
            </Typography>
          </Box>

          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <InputMask
                mask="99999-999"
                onChange={value => handleChangeCep(value)}
                value={formik.values.zipCode}                
              >
                {() => 
                  <TextField
                    fullWidth
                    label="CEP"
                    value={formik.values.zipCode}
                    error={Boolean(touched.zipCode && errors.zipCode)}
                    helperText={touched.zipCode && errors.zipCode}
                  />
                }
              </InputMask>

              <TextField
                fullWidth
                label="Nome da Rua"
                {...getFieldProps("address")}
                error={Boolean(touched.address && errors.address)}
                helperText={touched.address && errors.address}
              />
              <TextField
                fullWidth
                label="Cidade"
                {...getFieldProps("city")}
                error={Boolean(touched.city && errors.city)}
                helperText={touched.city && errors.city}
              />
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField
                fullWidth
                label="Número"
                {...getFieldProps("number")}
                error={Boolean(touched.number && errors.number)}
                helperText={touched.number && errors.number}
              />
              <TextField
                fullWidth
                label="Complemento"
                {...getFieldProps("complement")}
                error={Boolean(touched.complement && errors.complement)}
                helperText={touched.complement && errors.complement}
              />
              <TextField
                fullWidth
                label="Bairro"
                {...getFieldProps("neighborhood")}
                error={Boolean(touched.neighborhood && errors.neighborhood)}
                helperText={touched.neighborhood && errors.neighborhood}
              />
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField
                fullWidth
                label="Estado/Região"
                {...getFieldProps("state")}
                error={Boolean(touched.state && errors.state)}
                helperText={touched.state && errors.state}
              />
              <TextField
                select
                fullWidth
                label="País"
                placeholder="Country"
                {...getFieldProps("country")}
                SelectProps={{ native: true }}
                error={Boolean(touched.country && errors.country)}
                helperText={touched.country && errors.country}
              >
                <option value="" />
                {countries.map((option) => (
                  <option key={option.code} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Tipo de endereço"
                {...getFieldProps("type")}
                error={Boolean(touched.type && errors.type)}
                helperText={touched.type && errors.type}
              >
                {ADDRESS_TYPE.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Label
                      variant="filled"
                      color={getAddressColor(option.value)}
                    >
                      {option.title}
                    </Label>
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
                type="button"
                variant="outlined"
                onClick={handleClose}
                loading={isSubmitting}
              >
                Fechar
              </LoadingButton>
              <></>
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

FormAddress.propTypes = {
  currentUser: PropTypes.object,
  handleClose: PropTypes.func,
};

export default FormAddress;
