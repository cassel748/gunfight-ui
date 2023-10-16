import React, { useState } from "react";
import * as Yup from "yup";
import PropTypes from "prop-types";
import { LoadingButton } from "@material-ui/lab";
import { Form, FormikProvider, useFormik } from "formik";
import {
  Box,
  Card,
  Stack,
  MenuItem,
  TextField,
  Typography,
  Grid,
  Button,
} from "@material-ui/core";
import Toast from "src/utils/toast";
import { useSelector } from "react-redux";
import { useAuthUser } from "next-firebase-auth";
import {
  FINANCIAL_OPERATION,
  FINANCIAL_OPERATION_ENUM,
  getFinancialColor,
} from "src/utils/enums";
import InputDate from "src/components/InputDate";
import InputCurrency from "src/components/InputCurrency";
import Label from "src/components/Label";
import ProductAutocomplete from "src/components/ProductAutocomplete";
import { formatCurrency } from "src/utils/string";

const FormFinancial = ({ currentWalletItem, handleClose, userId }) => {
  const [product, setProduct] = useState({});
  const [personalCount, setPersonalCount] = useState(0);

  const isDebit = currentWalletItem?.type === FINANCIAL_OPERATION_ENUM.DEBIT;
  const isProduct =
    currentWalletItem?.type === FINANCIAL_OPERATION_ENUM.PRODUCT;

  const AuthUser = useAuthUser();
  const userInfo = useSelector((state) => state.user.userInfo);
  const UserFinancialSchema = Yup.object().shape({
    value: Yup.string().required("Valor é obrigatório"),
    type: Yup.string().required("Tipo é obrigatório"),
    description: Yup.string().when("type", {
      is: (type) => [1, 2].includes(type),
      then: Yup.string().required("Descrição é obrigatória"),
    }),
    date: Yup.string().when("type", {
      is: (type) => [1, 2].includes(type),
      then: Yup.string().required("Data da Transação é obrigatória"),
    }),
    productId: Yup.string().when("type", {
      is: (type) => type === 3,
      then: Yup.string().required("Produto é obrigatório"),
    }),
    quantity: Yup.string().when("type", {
      is: (type) => type === 3,
      then: Yup.string()
        .required("Quantidade obrigatória")
        .min(1, "Quantidade não pode ser menor que um"),
    }),
    subtotal: Yup.string().when("type", {
      is: (type) => type === 3,
      then: Yup.string().required("Sub-total é obrigatório"),
    }),
  });

  const formik = useFormik({
    initialValues: {
      value: Number(currentWalletItem?.value || 0),
      type: currentWalletItem?.type || "",
      description: currentWalletItem?.description || "",
      date: currentWalletItem?.date || "",
      productId: currentWalletItem?.productId || "",
      quantity: currentWalletItem?.quantity || 0,
      discount: currentWalletItem?.discount || 0,
      subtotal: Number(currentWalletItem?.value || 0),
    },
    validationSchema: UserFinancialSchema,
    onSubmit: async (values) => {
      try {
        const token = await AuthUser.getIdToken();
        const body = {
          ...values,
          associateId: userId,
          createdBy: userInfo.id,
        };

        if (product && values.productId) {
          body.product = product;
        }

        const response = await fetch("/api/associate/wallet", {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            Authorization: token,
          },
        });

        const data = await response.json();

        if (data && data.success) {
          Toast.success("Transação cadastrada com sucesso!");

          if (product && values.productId) {
            body.product = product;
            body.date = new Date();
            body.discount = Number(values.discount);

            if (
              product.objectID === "0vzAO6KfO3DDpWYNZtVP" ||
              product.objectID === "b7f34P6M2IRs4vRxQsZ6"
            ) {
              const responseData = await fetch("/api/associate/data", {
                method: "POST",
                body: JSON.stringify({
                  id: userId,
                  personalClasses: formik.values.quantity,
                }),
                headers: {
                  Authorization: token,
                },
              });

              const personalData = await responseData.json();
              if (personalData && personalData.success) {
                Toast.success("Aulas de personal atualizadas!");
              }
            }
          }

          handleClose(true);
        }
      } catch (err) {
        console.log(err);
      }
    },
  });

  const handleFieldChange = (field, event) => {
    const value = event.target.value;
    formik.setFieldValue(field, value);
  };

  const getItemDescription = () => {
    if (isDebit) {
      return "Débito";
    }

    if (isProduct) {
      return "Produto";
    }

    return "Crédito";
  };

  const { errors, touched, isSubmitting, getFieldProps } = formik;

  const onSelectProduct = (product) => {
    const newProduct = { ...product };
    delete newProduct._highlightResult;
    delete newProduct._snippetResult;

    setProduct(newProduct);

    formik.setFieldValue("date", new Date());
    formik.setFieldValue("description", newProduct.title);
    formik.setFieldValue("value", newProduct.price * formik.values.quantity);
  };

  const getTotal = () => {
    return product.price * formik.values.quantity;
  };

  const getFinalTotal = () => {
    const total = getTotal();
    if (!total) {
      return 0;
    }
    const discount = formik.values.discount || 0;
    return total - discount;
  };

  const onChangeQuantity = () => {
    formik.setFieldValue("value", getFinalTotal());
    formik.setFieldValue("subtotal", product.price * formik.values.quantity);
  };

  const onChangeDiscount = () => {
    const total = getTotal();
    const discount = formik.values.discount;
    formik.setFieldValue("value", total - discount);
  };

  const applyDiscount = (percentage) => {
    const total = product.price * formik.values.quantity;
    formik.setFieldValue("discount", Number(total * percentage));
  };

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off">
        <Card sx={{ p: 3 }}>
          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-start" }}>
            <Typography variant="h5" paragraph>
              Adicionar {getItemDescription()}
            </Typography>
          </Box>

          {!isProduct && (
            <Stack spacing={3}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 3, sm: 2 }}
              >
                <TextField
                  fullWidth
                  label="Descrição"
                  {...getFieldProps("description")}
                  error={Boolean(touched.description && errors.description)}
                  helperText={touched.description && errors.description}
                />
              </Stack>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 3, sm: 2 }}
              >
                <TextField
                  select
                  fullWidth
                  label="Tipo de Transação"
                  {...getFieldProps("type")}
                  error={Boolean(touched.type && errors.type)}
                  helperText={touched.type && errors.type}
                >
                  {FINANCIAL_OPERATION.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Label
                        variant="filled"
                        color={getFinancialColor(option.value)}
                      >
                        {option.title}
                      </Label>
                    </MenuItem>
                  ))}
                </TextField>

                <InputDate
                  label="Data da Transação"
                  onChange={(date) => handleFieldChange("date", date)}
                  value={formik.values.date}
                  error={Boolean(touched.date && errors.date)}
                  helperText={touched.date && errors.date}
                />

                <InputCurrency
                  fullWidth
                  label="Valor"
                  {...getFieldProps("value")}
                  error={Boolean(touched.value && errors.value)}
                  helperText={touched.value && errors.value}
                />
              </Stack>
            </Stack>
          )}

          {isProduct && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ProductAutocomplete
                  fullWidth
                  label="Produto"
                  onChange={(event) => handleFieldChange("productId", event)}
                  onSelect={onSelectProduct}
                  error={Boolean(touched.productId && errors.productId)}
                  helperText={touched.productId && errors.productId}
                />
              </Grid>

              <Grid item xs={6}>
                <InputCurrency
                  style={{ width: "100%", marginRight: 8, marginBottom: 12 }}
                  label="Preço Original"
                  value={product.price}
                  disabled
                />
              </Grid>

              <Grid item xs={6}>
                <InputCurrency
                  style={{ width: "100%", marginRight: 8, marginBottom: 12 }}
                  label="Sub-total"
                  value={formik.values.subtotal}
                  disabled
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantidade"
                  {...getFieldProps("quantity")}
                  helperText={touched.quantity && errors.quantity}
                  error={Boolean(touched.quantity && errors.quantity)}
                  onKeyUp={onChangeQuantity}
                />
              </Grid>

              <Grid item xs={6}>
                <InputCurrency
                  style={{ width: "100%", marginRight: 8, marginBottom: 12 }}
                  label="Desconto Item"
                  {...getFieldProps("discount")}
                  error={Boolean(touched.discount && errors.discount)}
                  helperText={touched.discount && errors.discount}
                  disabled={!formik.values.quantity}
                  onKeyPress={onChangeDiscount}
                />
              </Grid>

              <Grid item xs={6} style={{ paddingTop: 0 }}></Grid>

              <Grid item xs={6} style={{ paddingTop: 0 }}>
                <Button
                  disabled={!formik.values.quantity}
                  variant="outlined"
                  style={{ height: 45, marginRight: 8, width: "31%" }}
                  onClick={() => applyDiscount(0.05)}
                >
                  5%
                </Button>

                <Button
                  disabled={!formik.values.quantity}
                  variant="outlined"
                  style={{ height: 45, marginRight: 8, width: "32%" }}
                  onClick={() => applyDiscount(0.07)}
                >
                  7%
                </Button>

                <Button
                  disabled={!formik.values.quantity}
                  variant="outlined"
                  style={{ height: 45, width: "32%" }}
                  onClick={() => applyDiscount(0.1)}
                >
                  10%
                </Button>
              </Grid>

              <Grid item xs={12}>
                <h3 style={{ margin: "4px 0", textAlign: "right" }}>
                  Total {formatCurrency(getFinalTotal())}
                </h3>
              </Grid>
            </Grid>
          )}

          <Stack spacing={3} style={{ marginTop: 18 }}>
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
                onClick={() => console.log(errors)}
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

FormFinancial.propTypes = {
  currentUser: PropTypes.object,
  handleClose: PropTypes.func,
};

export default FormFinancial;
