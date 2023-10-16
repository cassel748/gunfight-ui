import React, { useState } from "react";
import * as Yup from "yup";
import PropTypes from "prop-types";
import Toast from "src/utils/toast";
import { useSelector } from "react-redux";
import { apiFetch } from "src/utils/apiFetch";
import { useAuthUser } from "next-firebase-auth";
import { LoadingButton } from "@material-ui/lab";
import { Form, FormikProvider, useFormik } from "formik";
import UserAutocomplete from "src/components/UserAutocomplete";
import { Box, Card, Grid, TextField, Typography } from "@material-ui/core";

const DialogAddConsumptionAssociated = ({
  item,
  invoiceId,
  handleClose,
  currentConsumption,
  cancelConsumptionAdd,
}) => {
  const userInfo = useSelector((state) => state.user.userInfo);

  const [productType] = useState(item.product?.type);
  const [user, setUser] = useState({});
  const AuthUser = useAuthUser();

  const shape = {
    productId: Yup.string().required("Escolha um produto"),
    quantity: Yup.number()
      .min(1, "Quantidade não pode ser menor que um")
      .max(
        item.availableQuantity,
        `Quantidade não pode ser maior que a quantidade disponível: ${item.availableQuantity}`
      )
      .required("Quantidade obrigatória"),
    sellerId: Yup.string().required("Vendedor(a) obrigatório"),
  };

  const initialValues = {
    productId: item.docId || "",
    quantity: currentConsumption?.quantity || "",
    sellerId: currentConsumption?.sellerId || "",
  };

  const UserAddressSchema = Yup.object().shape(shape);

  const formik = useFormik({
    initialValues,
    validationSchema: UserAddressSchema,
    onSubmit: async (values) => {
      try {
        const data = await apiFetch(
          "/invoice/item?action=ADD_FROM_INVENTORY",
          {
            invoiceId,
            quantity: values?.quantity || undefined,
            productPrice: item?.product?.price,
            sellerId: values.sellerId,
            sellerName: user?.name,
            productTitle: item?.product?.title,
            productType: productType,
            productId: item.docId,
            createdBy: userInfo?.id,
            failCount: 0,
            applyDiscount: false,
            itemDiscount: 0,
          },
          "POST"
        );

        if (data && data.success) {
          handleClose(true, true);
          Toast.success("Item adicionado com sucesso!");
        }

        if (data && data.success === false) {
          Toast.error(data.message);
        }
      } catch (e) {
        console.log(err);
      }
    },
  });

  const { errors, touched, isSubmitting, getFieldProps, values } = formik;

  const onChangeField = (fieldName) => (event) => {
    const value = event.target.value;
    formik.setFieldValue(fieldName, value);
  };

  const onSelectUser = (user) => {
    setUser(user);
  };

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off">
        <Card sx={{ p: 3 }}>
          <Box sx={{ mt: 1 }}>
            <Typography sx={{ color: "primary.main" }} variant="h5">
              PRODUTO SELECIONADO:{" "}
            </Typography>
            <Typography variant="h6">{item.product?.title}</Typography>
          </Box>
          <Grid container spacing={3} mt={1}>
            <Grid item sm={4} xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Quantidade"
                {...getFieldProps("quantity")}
                helperText={touched.quantity && errors.quantity}
                error={Boolean(touched.quantity && errors.quantity)}
              />
            </Grid>
            <Grid item sm={8} xs={12}>
              <UserAutocomplete
                fullWidth
                label="Vendedor"
                onChange={onChangeField("sellerId")}
                onSelect={onSelectUser}
                error={Boolean(touched.sellerId && errors.sellerId)}
                helperText={touched.sellerId && errors.sellerId}
              />
            </Grid>

            <Grid
              mt={2}
              container
              spacing={3}
              direction="row"
              alignItems="center"
              justifyContent="flex-end"
            >
              <Grid item sm={3} xs={12}>
                <LoadingButton
                  fullWidth
                  size="large"
                  type="button"
                  loading={isSubmitting}
                  variant="outlined"
                  onClick={cancelConsumptionAdd}
                >
                  Cancelar
                </LoadingButton>
              </Grid>
              <Grid item sm={3} xs={12}>
                <LoadingButton
                  fullWidth
                  size="large"
                  type="submit"
                  loading={isSubmitting}
                  variant="contained"
                  // onClick={() => console.log(errors)}
                >
                  Adicionar
                </LoadingButton>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      </Form>
    </FormikProvider>
  );
};

DialogAddConsumptionAssociated.propTypes = {
  handleClose: PropTypes.func,
  cancelConsumptionAdd: PropTypes.func,
};

export default DialogAddConsumptionAssociated;
