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
  MenuItem,
  TextField,
  Typography,
} from "@material-ui/core";
import { CONTACT_HISTORY_CHANNEL, CONTACT_HISTORY_REASONS } from "src/utils/enums";
import { useAuthUser } from "next-firebase-auth";
import { useSelector } from "react-redux";
import Toast from "src/utils/toast";
import UserAutocomplete from "src/components/UserAutocomplete";

const FormContact = ({ currentContactHistory, handleClose, userId }) => {
  const AuthUser = useAuthUser();
  const userInfo = useSelector(state => state.user.userInfo);
  const [user, setUser] = useState({});

  const UserAddressSchema = Yup.object().shape({
    reason: Yup.string().required("Motivo obrigatório"),
    channel: Yup.string().required("Canal obrigatório"),
    date: Yup.string().required("Data do contato obrigatória"),
    description: Yup.string().required("Descrição é obrigatória"),
  });

  const formik = useFormik({
    initialValues: {
      reason: currentContactHistory?.reason || "",
      channel: currentContactHistory?.channel || "",
      date: currentContactHistory?.date || "",
      description: currentContactHistory?.description || "",
      sellerId: currentContactHistory?.sellerId || "",
    },

    validationSchema: UserAddressSchema,
    onSubmit: async (values) => {
      try {
        const token = await AuthUser.getIdToken();
        const response = await fetch("/api/associate/contact-history", {
          method: "POST",
          body: JSON.stringify({
            ...values,
            sellerName: user.name,
            associateId: userId,
            createdBy: userInfo.id,
          }),
          headers: {
            Authorization: token
          }
        });

        const data = await response.json();

        if (data && data.success) {
          Toast.success("Histórico de contato cadastrado com sucesso!");
          handleClose(true);
        }
      } catch(e) {
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
              Novo Histórico de Contato
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
                label="Motivo"
                {...getFieldProps("reason")}
                error={Boolean(touched.reason && errors.reason)}
                helperText={touched.reason && errors.reason}
              >
                {CONTACT_HISTORY_REASONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.title}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Canal"
                {...getFieldProps("channel")}
                error={Boolean(touched.channel && errors.channel)}
                helperText={touched.channel && errors.channel}
              >
                {CONTACT_HISTORY_CHANNEL.map((option) => (
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
              <div style={{ minWidth: '71%'}}>
                <UserAutocomplete
                  fullWidth
                  label="Vendedor"
                  onChange={(event) => handleFieldChange("sellerId", event)}
                  onSelect={onSelectUser}
                  error={Boolean(touched.sellerId && errors.sellerId)}
                  helperText={touched.sellerId && errors.sellerId}
                />
              </div>

              <InputDate
                value=""
                label="Data do contato"
                onChange={event => handleFieldChange('date', event)}
                error={Boolean(touched.date && errors.date)}
                helperText={touched.date && errors.date}
              />
            </Stack>
            <Stack>
              <TextField
                multiline
                label="Descrição"
                rows={4}
                {...getFieldProps("description")}
                error={Boolean(touched.description && errors.description)}
                helperText={touched.description && errors.description}
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

FormContact.propTypes = {
  currentUser: PropTypes.object,
  handleClose: PropTypes.func,
};

export default FormContact;
