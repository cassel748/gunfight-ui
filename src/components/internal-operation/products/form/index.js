import React, { useState } from "react";
import * as Yup from "yup";
import PropTypes from "prop-types";
import Toast from "src/utils/toast";
import Label from "src/components/Label";
import { useSelector } from "react-redux";
import { LoadingButton } from "@material-ui/lab";
import { useAuthUser } from "next-firebase-auth";
import { Form, FormikProvider, useFormik } from "formik";
import InputCurrency from "src/components/InputCurrency";
import {
  BOND,
  getBondColor,
  TYPE_PRODUCT,
  getOriginColor,
  getStatusColor,
  SITUATION_PRODUCT,
} from "src/utils/enums";
import {
  Box,
  Card,
  Stack,
  Switch,
  MenuItem,
  TextField,
  Typography,
  FormControlLabel,
} from "@material-ui/core";

const FormProduct = ({ currentProduct, handleClose }) => {
  const AuthUser = useAuthUser();

  const [typeValue, setTypeValue] = useState(0);

  const userInfo = useSelector((state) => state.user.userInfo);
  const UserAddressSchema = Yup.object().shape({
    title: Yup.string().required("Título obrigatório"),
    price: Yup.number().required("Valor obrigatório"),
    type: Yup.string().required("Tipo obrigatório"),
    productCode: Yup.string(),
    size: Yup.string(),
    color: Yup.string(),
    situation: Yup.string().required("Status obrigatório"),
    bond: Yup.string(),
    description: Yup.string(),
    armamentBond: Yup.bool(),
    barcode: Yup.number(),
    eventAttached: Yup.bool(),
    inventoryQuantity: Yup.number(),
    minimumInventoryQuantity: Yup.number(),
  });

  const formik = useFormik({
    initialValues: {
      title: currentProduct?.title || "",
      type: currentProduct?.type || "",
      price: currentProduct?.price || 0,
      productCode: currentProduct?.productCode || "",
      size: currentProduct?.size || "",
      color: currentProduct?.color || "",
      situation: currentProduct?.situation || "",
      bond: currentProduct?.bond || "",
      description: currentProduct?.description || "",
      armamentBond: currentProduct?.armamentBond || false,
      barcode: currentProduct?.barcode || "",
      eventAttached: currentProduct?.eventAttached || false,
      inventoryQuantity: currentProduct?.inventoryQuantity || "",
      minimumInventoryQuantity: currentProduct?.minimumInventoryQuantity || "",
    },

    validationSchema: UserAddressSchema,
    onSubmit: async (values) => {
      try {
        if (currentProduct?.docId) {
          return handleUpdateProduct(values);
        }

        const token = await AuthUser.getIdToken();
        const response = await fetch("/api/internal/products", {
          method: "POST",
          body: JSON.stringify({
            ...values,
            createdBy: userInfo.id,
          }),
          headers: {
            Authorization: token,
          },
        });

        const data = await response.json();

        if (data && data.success) {
          Toast.success("Produto cadastrado com sucesso!");
          handleClose(true);
        }
      } catch (err) {
        Toast.success("Erro ao criar Produto");
        console.log(err);
      }
    },
  });

  const [isDisabledArmamentBond, setIsDisabledArmamentBond] = useState(false);

  const checkArmamentBond = (event) => {
    const value = event.target.value;
    formik.setFieldValue("bond", value);

    if (value === 3) {
      formik.setFieldValue("armamentBond", false);
      return setIsDisabledArmamentBond(true);
    }
    setIsDisabledArmamentBond(false);
  };

  const { errors, touched, isSubmitting, getFieldProps, values } = formik;

  const handleUpdateProduct = async (values) => {
    try {
      const token = await AuthUser.getIdToken();
      const response = await fetch("/api/internal/products", {
        method: "PUT",
        body: JSON.stringify({
          ...values,
          modifiedBy: userInfo.id,
          docId: currentProduct?.docId,
        }),
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();

      if (data && data.success) {
        Toast.success("Produto atualizado com sucesso!");
        handleClose(true);
      }
    } catch (e) {
      Toast.error("Erro ao atualizar produto!");
      console.log(e);
    }
  };

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off">
        <Card sx={{ p: 3 }}>
          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-start" }}>
            <Typography variant="h5" paragraph>
              Produto
            </Typography>
          </Box>

          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField
                fullWidth
                label="Título"
                {...getFieldProps("title")}
                error={Boolean(touched.title && errors.title)}
                helperText={touched.title && errors.title}
              />
              <InputCurrency
                fullWidth
                label="Valor"
                {...getFieldProps("price")}
                error={Boolean(touched.price && errors.price)}
                helperText={touched.price && errors.price}
              />
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField
                select
                fullWidth
                label="Tipo"
                placeholder="Tipo"
                {...getFieldProps("type")}
                error={Boolean(touched.type && errors.type)}
                helperText={touched.type && errors.type}
              >
                {TYPE_PRODUCT.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    onClick={() => {
                      setTypeValue(option.value);
                      console.log(option.value);
                    }}
                  >
                    <Label
                      variant="filled"
                      color={getOriginColor(option.value)}
                    >
                      {option.title}
                    </Label>
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Status"
                {...getFieldProps("situation")}
                error={Boolean(touched.situation && errors.situation)}
                helperText={touched.situation && errors.situation}
              >
                {SITUATION_PRODUCT.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Label
                      variant="filled"
                      color={getStatusColor(option.value)}
                    >
                      {option.title}
                    </Label>
                  </MenuItem>
                ))}
              </TextField>
              {typeValue !== 8 && (
                <TextField
                  fullWidth
                  type="number"
                  label="Quantidade mínima"
                  {...getFieldProps("minimumInventoryQuantity")}
                  helperText={
                    touched.minimumInventoryQuantity &&
                    errors.minimumInventoryQuantity
                  }
                  error={Boolean(
                    touched.minimumInventoryQuantity &&
                      errors.minimumInventoryQuantity
                  )}
                />
              )}
              <TextField
                fullWidth
                type="number"
                label="Quantidade em Estoque"
                {...getFieldProps("inventoryQuantity")}
                helperText={
                  touched.inventoryQuantity && errors.inventoryQuantity
                }
                error={Boolean(
                  touched.inventoryQuantity && errors.inventoryQuantity
                )}
              />
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField
                fullWidth
                label={
                  typeValue === 8 ? "Número de série" : "Código do produto"
                }
                {...getFieldProps("productCode")}
                // error={Boolean(touched.productCode && errors.productCode)}
                helperText={touched.productCode && errors.productCode}
              />
              <TextField
                fullWidth
                label="Tamanho"
                {...getFieldProps("size")}
                // error={Boolean(touched.size && errors.size)}
                helperText={touched.size && errors.size}
              />
              <TextField
                fullWidth
                label="Cor"
                {...getFieldProps("color")}
                // error={Boolean(touched.size && errors.size)}
                helperText={touched.color && errors.color}
              />
            </Stack>

            {values.type === 4 && (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 3, sm: 2 }}
              >
                <TextField
                  select
                  label="Vínculo"
                  style={{ width: "49%" }}
                  {...getFieldProps("bond")}
                  onChange={checkArmamentBond}
                  error={Boolean(touched.bond && errors.bond)}
                  helperText={touched.bond && errors.bond}
                >
                  {BOND.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Label
                        variant="filled"
                        color={getBondColor(option.value)}
                      >
                        {option.title}
                      </Label>
                    </MenuItem>
                  ))}
                </TextField>

                <FormControlLabel
                  control={
                    <Switch
                      fullWidth
                      disabled={isDisabledArmamentBond}
                      size="normal"
                      {...getFieldProps("armamentBond")}
                      checked={values.armamentBond}
                    />
                  }
                  label="Necessita vínculo de armamento"
                />
              </Stack>
            )}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField
                fullWidth
                style={{ width: "75%" }}
                label="Código de barras"
                {...getFieldProps("barcode")}
                error={Boolean(touched.barcode && errors.barcode)}
                helperText={touched.barcode && errors.barcode}
              />
              <FormControlLabel
                control={
                  <Switch
                    fullWidth
                    size="normal"
                    checked={values.eventAttached}
                    {...getFieldProps("eventAttached")}
                  />
                }
                label="Vincular a Evento"
              />
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Descrição"
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

FormProduct.propTypes = {
  currentProduct: PropTypes.object,
  handleClose: PropTypes.func,
};

export default FormProduct;
