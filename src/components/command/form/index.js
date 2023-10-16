import React, { useState } from "react";
import * as Yup from "yup";
import PropTypes from "prop-types";
import { LoadingButton } from "@material-ui/lab";
import { Form, FormikProvider, useFormik } from "formik";
import { Box, Card, Grid, TextField, Typography } from "@material-ui/core";
import AssociateAutocomplete from "src/components/AssociateAutocomplete";
import UserAutocomplete from "src/components/UserAutocomplete";
import { useSelector } from "react-redux";
import Toast from "src/utils/toast";
import { useRouter } from "next/router";
import { getFirebaseAdmin, useAuthUser } from "next-firebase-auth";

const FormCommand = ({ currentUser, handleClose, invoiceId }) => {
  const [user, setUser] = useState({});
  const [associate, setAssociate] = useState({});

  const router = useRouter();
  const userInfo = useSelector((state) => state.user.userInfo);
  const AuthUser = useAuthUser();

  const UserAddressSchema = Yup.object().shape({
    number: Yup.string()
      .length(4, "O número da comanda deve possuir 4 digitos")
      .required("Número obrigatório"),
    associate: Yup.string().required("Associado obrigatório"),
    seller: Yup.string().required("Vendedor obrigatório"),
  });

  const formik = useFormik({
    initialValues: {
      number: invoiceId || "",
      associate: currentUser?.associate || "",
      seller: currentUser?.seller || "",
    },
    validationSchema: UserAddressSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          associateId: associate.objectID,
          associateName: associate.name,
          associateNumber: associate.affiliationNumber,
          associateCrNumber: associate.crNumber,
          nextPayment: associate.nextPayment ? associate.nextPayment : "",
          invoiceId: values.number,
          internalUserType: associate.internalUserType,
          sellerId: values.seller,
          sellerName: user.name,
          total: 0,
          createdBy: userInfo.id,
        };

        const token = await AuthUser.getIdToken();
        const response = await fetch("/api/invoice", {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            Authorization: token,
          },
        });

        const data = await response.json();

        if (data.success) {
          Toast.success("Comanda iniciada com sucesso!");
          //router.push(`/actions/invoices/${data.createdInvoiceId}`);
          handleClose();
        }

        if (data.success === false && data.message) {
          Toast.error(data.message);
        }
      } catch (e) {
        Toast.error("Erro ao iniciar comanda!");
      }
    },
  });

  const onChangeField = (fieldName) => (event) => {
    const value = event.target.value;
    formik.setFieldValue(fieldName, value);
  };

  const onSelectAssociate = (associate) => {
    setAssociate(associate);
  };

  const onSelectUser = (user) => {
    setUser(user);
  };

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
            <Typography variant="h5">Iniciar Comanda</Typography>
          </Box>

          <Grid
            mt={1}
            container
            spacing={3}
            direction={{ xs: "column", sm: "column" }}
          >
            <Grid item sm={6} xs={12}>
              <TextField
                label="Número"
                {...getFieldProps("number")}
                error={Boolean(touched.number && errors.number)}
                helperText={touched.number && errors.number}
                disabled={invoiceId}
                autoFocus={!invoiceId}
              />
            </Grid>
            <Grid item sm={12} xs={12}>
              <AssociateAutocomplete
                fullWidth
                label="Associado"
                onChange={onChangeField("associate")}
                onSelect={onSelectAssociate}
                error={Boolean(touched.associate && errors.associate)}
                helperText={touched.associate && errors.associate}
                autoFocus={invoiceId}
              />
            </Grid>
            <Grid item sm={12} xs={12}>
              <UserAutocomplete
                fullWidth
                label="Vendedor"
                onChange={onChangeField("seller")}
                onSelect={onSelectUser}
                error={Boolean(touched.seller && errors.seller)}
                helperText={touched.seller && errors.seller}
              />
            </Grid>
            <Grid container>
              <Grid
                item
                xs={12}
                mt={3}
                justifyContent="flex-end"
                display="flex"
              >
                <LoadingButton
                  variant="outlined"
                  loading={isSubmitting}
                  style={{ marginRight: 14 }}
                  onClick={handleClose}
                >
                  Cancelar
                </LoadingButton>

                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                >
                  Iniciar
                </LoadingButton>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      </Form>
    </FormikProvider>
  );
};

FormCommand.propTypes = {
  currentUser: PropTypes.object,
  handleClose: PropTypes.func,
};

export default FormCommand;
