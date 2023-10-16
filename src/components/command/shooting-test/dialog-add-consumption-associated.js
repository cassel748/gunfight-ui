import React, { useState } from "react";
import * as Yup from "yup";
import PropTypes from "prop-types";
import { LoadingButton } from "@material-ui/lab";
import { Form, FormikProvider, useFormik } from "formik";
import {
  Box,
  Card,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@material-ui/core";
import baselineDelete from "@iconify/icons-ic/baseline-delete";
import { Icon } from "@iconify/react";

const DialogShootingTest = ({
  handleClose,
  onCancel,
}) => {
  const [weaponList, setWeaponList] = useState([
    {
      type: "PISTOLA",
      model: "G25",
      brand: "GLOCK",
      caliber: ".380 ACP",
    },
    {
      type: "ESPINGARDA",
      model: "MILITARY 3.0",
      brand: "CBC",
      caliber: "12",
    }
  ]);

  const shape = {
    type: Yup.string(),
    model: Yup.string(),
    caliber: Yup.string(),
    brand: Yup.string(),
  };

  const initialValues = {
    type: "",
    model: "",
    caliber: "",
    brand: "",
  };

  const WeaponListSchema = Yup.object().shape(shape);

  const formik = useFormik({
    initialValues,
    validationSchema: WeaponListSchema,
    onSubmit: async () => {
      handleClose(weaponList)
    },
  });

  const { errors, touched, isSubmitting } = formik;

  const onChangeField = (fieldName, index) => (event) => {
    const value = event.target.value;
    const newWeaponList = [...weaponList];

    newWeaponList[index][fieldName] = value;
    setWeaponList(newWeaponList);
  };

  const addWeapon = () => {
    let newWeaponList = weaponList.concat([
      {
        type: "",
        model: "",
        caliber: "",
        brand: "",
      }
    ]);
    setWeaponList(newWeaponList);
  }

  const removeWeapon = (index) => {
    const newWeaponList = [...weaponList];
    newWeaponList.splice(index, 1);

    setWeaponList(newWeaponList);
  }

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off">
        <Card sx={{ p: 3 }}>
          <Box sx={{ mt: 1 }}>
            <Typography sx={{color: 'primary.main'}} variant="h5">ARMAS USADAS NO TESTE</Typography>
          </Box>

          {weaponList.map((weapon, index) => (
            <Grid container spacing={3} mt={1}>
              <Grid item sm={3} xs={12}>
                <TextField
                  fullWidth
                  type="text"
                  label="Tipo"
                  value={weapon.type}
                  helperText={touched.type && errors.type}
                  error={Boolean(touched.type && errors.type)}
                  onChange={onChangeField("type", index)}
                />
              </Grid>
              <Grid item sm={3} xs={12}>
                <TextField
                  fullWidth
                  type="text"
                  label="Modelo"
                  value={weapon.model}
                  helperText={touched.model && errors.model}
                  error={Boolean(touched.model && errors.model)}
                  onChange={onChangeField("model", index)}
                />
              </Grid>
              <Grid item sm={3} xs={12}>
                <TextField
                  fullWidth
                  type="text"
                  label="Marca"
                  value={weapon.brand}
                  helperText={touched.brand && errors.brand}
                  error={Boolean(touched.brand && errors.brand)}
                  onChange={onChangeField("brand", index)}
                />
              </Grid>
              <Grid item sm={2} xs={12}>
                <TextField
                  fullWidth
                  type="text"
                  label="Calibre"
                  value={weapon.caliber}
                  helperText={touched.caliber && errors.caliber}
                  error={Boolean(touched.caliber && errors.caliber)}
                  onChange={onChangeField("caliber", index)}
                />
              </Grid>
              <Grid item sm={1} xs={12}>
                <IconButton onClick={() => removeWeapon(index)}>
                  <Icon icon={baselineDelete} />
                </IconButton>
              </Grid>
            </Grid>
          ))}

          <div style={{ textAlign: "center", marginTop: 18 }}>
            <LoadingButton
              fullWidth
              size="large"
              loading={isSubmitting}
              variant="text"
              onClick={() => addWeapon()}
              style={{ width: 195 }}
            >
              Adicionar Arma
            </LoadingButton>
          </div>

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
                onClick={onCancel}
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
              >
                Imprimir
              </LoadingButton>
            </Grid>
          </Grid>
        </Card>
      </Form>
    </FormikProvider>
  );
};

DialogShootingTest.propTypes = {
  handleClose: PropTypes.func,
  onCancel: PropTypes.func,
};

export default DialogShootingTest;
