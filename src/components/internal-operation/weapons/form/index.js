import React, { useState } from "react";
import * as Yup from "yup";
import PropTypes from "prop-types";
import Toast from "src/utils/toast";

import { LoadingButton } from "@material-ui/lab";
import { useAuthUser } from "next-firebase-auth";
import { Form, FormikProvider, useFormik } from "formik";
import {
  Box,
  Card,
  Stack,
  MenuItem,
  useTheme,
  TextField,
  Typography,
} from "@material-ui/core";
import { useSelector } from "react-redux";
import Label from "src/components/Label";
import InputDate from "src/components/InputDate";
import {
  PFA_COVERAGE,
  WEAPON_ORIGIN,
  WEAPON_STATUS_EB,
  WEAPON_STATUS_PF,
  getWeaponSystemColor,
  WEAPON_ORIGIN_OR_CLUB,
  getWeaponOriginColor,
} from "src/utils/enums";

const FormWeapon = ({ currentWeapon, handleClose }) => {
  const theme = useTheme();
  const AuthUser = useAuthUser();
  const userInfo = useSelector((state) => state.user.userInfo);
  const UserAddressSchema = Yup.object().shape({
    brand: Yup.string().required("Marca obrigatório"),
    model: Yup.string().required("Modelo obrigatório"),
    species: Yup.string().required("Espécie obrigatório"),
    caliber: Yup.string().required("Calibre obrigatório"),
    serialNumber: Yup.string().required("Número de série obrigatório"),
    trafficGuideNumber: Yup.string(),
    atualTrafficGuideExpireDate: Yup.string().nullable(),
    oldTrafficGuideExpireDate: Yup.string().nullable(),
    militaryRegion: Yup.string(),
    sigmaSinarmNumber: Yup.string(),
    crafRegister: Yup.string(),
    crafExpireDate: Yup.string().nullable(),
    crafExpeditionDate: Yup.string().nullable(),
    origin: Yup.string().required("Selecione o órgão de registro"),
    originStoreOrClub: Yup.string().required("Selecione a orgiem da arma"),
    status: Yup.string().required("Selecione o status da arma"),
    rfaRegisterNumber: Yup.string(),
    rfaSinarmRegistrationNumber: Yup.string(),
    rfaRegisterExpireDate: Yup.string().nullable(),
    pfaCertificateNumber: Yup.string(),
    pfaExpedition: Yup.string(),
    pfaCategory: Yup.string(),
    pfaCoverage: Yup.string(),
    pfaExpeditionDate: Yup.string().nullable(),
    pfaExpiraDate: Yup.string().nullable(),
  });

  const formik = useFormik({
    initialValues: {
      brand: currentWeapon?.brand || "",
      model: currentWeapon?.model || "",
      caliber: currentWeapon?.caliber || "",
      species: currentWeapon?.species || "",
      serialNumber: currentWeapon?.serialNumber || "",
      trafficGuideNumber: currentWeapon?.trafficGuideNumber || "",
      atualTrafficGuideExpireDate:
        currentWeapon?.atualTrafficGuideExpireDate || "",
      oldTrafficGuideExpireDate: currentWeapon?.oldTrafficGuideExpireDate || "",
      militaryRegion: currentWeapon?.militaryRegion || "",
      sigmaSinarmNumber: currentWeapon?.sigmaSinarmNumber || "",
      crafRegister: currentWeapon?.crafRegister || "",
      crafExpireDate: currentWeapon?.crafExpireDate || "",
      crafExpeditionDate: currentWeapon?.crafExpeditionDate || "",
      origin: currentWeapon?.origin || "",
      originStoreOrClub: currentWeapon?.originStoreOrClub || "",
      status: currentWeapon?.status || "",
      rfaRegisterNumber: currentWeapon?.rfaRegisterNumber || "",
      rfaSinarmRegistrationNumber:
        currentWeapon?.rfaSinarmRegistrationNumber || "",
      rfaRegisterExpireDate: currentWeapon?.rfaRegisterExpireDate || "",
      pfaCertificateNumber: currentWeapon?.pfaCertificateNumber || "",
      pfaExpedition: currentWeapon?.pfaExpedition || "",
      pfaCategory: currentWeapon?.pfaCategory || "",
      pfaCoverage: currentWeapon?.pfaCoverage || "",
      pfaExpeditionDate: currentWeapon?.pfaExpeditionDate || "",
      pfaExpiraDate: currentWeapon?.pfaExpiraDate || "",
    },

    validationSchema: UserAddressSchema,
    onSubmit: async (values) => {
      try {
        if (currentWeapon?.docId) {
          return handleUpdateWeapon(values);
        }

        const token = await AuthUser.getIdToken();
        const response = await fetch("/api/internal/weapons", {
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
          Toast.success("Arma cadastrada com sucesso!");
          handleClose(true);
        }
      } catch (err) {
        Toast.success("Erro ao criar Arma");
        console.log(err);
      }
    },
  });

  const { errors, touched, isSubmitting, getFieldProps } = formik;

  const [originValue, setOriginValue] = useState(currentWeapon?.origin);

  const handleUpdateWeapon = async (values) => {
    try {
      const token = await AuthUser.getIdToken();
      const response = await fetch("/api/internal/weapons", {
        method: "PUT",
        body: JSON.stringify({
          ...values,
          modifiedBy: userInfo.id,
          docId: currentWeapon?.docId,
        }),
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();

      if (data && data.success) {
        Toast.success("Arma atualizada com sucesso!");
        handleClose(true);
      }
    } catch (e) {
      Toast.error("Erro ao atualizar arma!");
      console.log(e);
    }
  };

  const handleFieldChange = (field, event) => {
    const value = event.target.value;
    formik.setFieldValue(field, value);
  };

  const getModalStyle = (origin) => {
    if (origin === 1) {
      return {
        border: `20px solid ${theme.palette.eb.main}`,
      };
    }

    if (origin === 2) {
      return {
        border: `20px solid ${theme.palette.pf.main}`,
      };
    }
  };

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off">
        <Card sx={{ p: 3 }} style={getModalStyle(originValue)}>
          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-start" }}>
            <Typography variant="h5" paragraph>
              Nova Arma
            </Typography>
          </Box>

          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField
                fullWidth
                label="Modelo"
                {...getFieldProps("model")}
                error={Boolean(touched.model && errors.model)}
                helperText={touched.model && errors.model}
              />
              <TextField
                fullWidth
                label="Marca"
                {...getFieldProps("brand")}
                error={Boolean(touched.brand && errors.brand)}
                helperText={touched.brand && errors.brand}
              />

              <TextField
                fullWidth
                label="Calibre"
                {...getFieldProps("caliber")}
                error={Boolean(touched.caliber && errors.caliber)}
                helperText={touched.caliber && errors.caliber}
              />
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField
                fullWidth
                label="Espécie"
                {...getFieldProps("species")}
                error={Boolean(touched.species && errors.species)}
                helperText={touched.species && errors.species}
              />

              <TextField
                fullWidth
                label="Número de série"
                {...getFieldProps("serialNumber")}
                error={Boolean(touched.serialNumber && errors.serialNumber)}
                helperText={touched.serialNumber && errors.serialNumber}
              />
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField
                select
                fullWidth
                label="Órgão de registro"
                {...getFieldProps("origin")}
                error={Boolean(touched.origin && errors.origin)}
                helperText={touched.origin && errors.origin}
              >
                {WEAPON_ORIGIN.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    onClick={() => {
                      setOriginValue(option.value);
                    }}
                  >
                    <Label
                      variant="filled"
                      color={getWeaponSystemColor(option.value)}
                    >
                      {option.title}
                    </Label>
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                style={{ width: 500 }}
                label="Origem da arma"
                {...getFieldProps("originStoreOrClub")}
                error={Boolean(touched.originStoreOrClub && errors.originStoreOrClub)}
                helperText={touched.originStoreOrClub && errors.originStoreOrClub}
              >
                {WEAPON_ORIGIN_OR_CLUB.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}

                  >
                    <Label
                      variant="filled"
                      color={getWeaponOriginColor(option.value)}
                    >
                      {option.title}
                    </Label>
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Status da arma"
                {...getFieldProps("status")}
                error={Boolean(touched.status && errors.status)}
                helperText={touched.status && errors.status}
              >
                {originValue === 1 &&
                  WEAPON_STATUS_EB.map((option) => (
                    <MenuItem key={option.value} value={option.title}>
                      {option.title}
                    </MenuItem>
                  ))}

                {originValue === 2 &&
                  WEAPON_STATUS_PF.map((option) => (
                    <MenuItem key={option.value} value={option.title}>
                      {option.title}
                    </MenuItem>
                  ))}
              </TextField>

            </Stack>

            {originValue === 2 && (
              <>
                <Typography variant="h5" paragraph>
                  Registro Federal de Arma de Fogo
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 3, sm: 2 }}
                >
                  <TextField
                    fullWidth
                    label="Número Registro"
                    {...getFieldProps("rfaRegisterNumber")}
                  />
                  <TextField
                    fullWidth
                    label="Número Cadastro Sinarm"
                    {...getFieldProps("rfaSinarmRegistrationNumber")}
                  />
                  <InputDate
                    fullWidth
                    label="Data Validade"
                    value={formik.values.rfaRegisterExpireDate}
                    onChange={(event) =>
                      handleFieldChange("rfaRegisterExpireDate", event)
                    }
                  />
                </Stack>
                <Typography variant="h5" paragraph>
                  Porte Federal de Arma
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 3, sm: 2 }}
                >
                  <TextField
                    fullWidth
                    label="Certificado Número"
                    {...getFieldProps("pfaCertificateNumber")}
                  />

                  <TextField
                    fullWidth
                    label="Expedição"
                    {...getFieldProps("pfaExpedition")}
                  />
                </Stack>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 3, sm: 2 }}
                >
                  <TextField
                    fullWidth
                    label="Categoria"
                    {...getFieldProps("pfaCategory")}
                  />
                  <TextField
                    select
                    fullWidth
                    label="Abrangência"
                    {...getFieldProps("pfaCoverage")}
                    error={Boolean(touched.pfaCoverage && errors.pfaCoverage)}
                    helperText={touched.pfaCoverage && errors.pfaCoverage}
                  >
                    {PFA_COVERAGE.map((option) => (
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
                  <InputDate
                    fullWidth
                    label="Data Expedição"
                    value={formik.values.pfaExpeditionDate}
                    onChange={(event) =>
                      handleFieldChange("pfaExpeditionDate", event)
                    }
                  />
                  <InputDate
                    fullWidth
                    label="Validade"
                    value={formik.values.pfaExpiraDate}
                    onChange={(event) =>
                      handleFieldChange("pfaExpiraDate", event)
                    }
                  />
                </Stack>
              </>
            )}

            {originValue === 1 && (
              <>
                <Typography variant="h5" paragraph>
                  CRAF
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 3, sm: 2 }}
                >
                  <TextField
                    fullWidth
                    label="Número Sigma"
                    {...getFieldProps("sigmaSinarmNumber")}
                    error={Boolean(
                      touched.sigmaSinarmNumber && errors.sigmaSinarmNumber
                    )}
                    helperText={
                      touched.sigmaSinarmNumber && errors.sigmaSinarmNumber
                    }
                  />
                  <TextField
                    fullWidth
                    label="Registro"
                    {...getFieldProps("crafRegister")}
                    error={Boolean(touched.crafRegister && errors.crafRegister)}
                    helperText={touched.crafRegister && errors.crafRegister}
                  />
                </Stack>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 3, sm: 2 }}
                >
                  <InputDate
                    fullWidth
                    label="Validade"
                    value={formik.values.crafExpireDate}
                    onChange={(event) =>
                      handleFieldChange("crafExpireDate", event)
                    }
                    error={Boolean(
                      touched.crafExpireDate && errors.crafExpireDate
                    )}
                    helperText={touched.crafExpireDate && errors.crafExpireDate}
                  />
                  <InputDate
                    fullWidth
                    label="Expedição"
                    value={formik.values.crafExpeditionDate}
                    onChange={(event) =>
                      handleFieldChange("crafExpeditionDate", event)
                    }
                    error={Boolean(
                      touched.crafExpeditionDate && errors.crafExpeditionDate
                    )}
                    helperText={
                      touched.crafExpeditionDate && errors.crafExpeditionDate
                    }
                  />
                </Stack>

                <Typography variant="h5" paragraph>
                  Guia de Tráfego
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 3, sm: 2 }}
                >
                  <TextField
                    fullWidth
                    label="Região Militar"
                    {...getFieldProps("militaryRegion")}
                    error={Boolean(
                      touched.militaryRegion && errors.militaryRegion
                    )}
                    helperText={touched.militaryRegion && errors.militaryRegion}
                  />
                  <TextField
                    fullWidth
                    label="Número guia de tráfego"
                    {...getFieldProps("trafficGuideNumber")}
                    error={Boolean(
                      touched.trafficGuideNumber && errors.trafficGuideNumber
                    )}
                    helperText={
                      touched.trafficGuideNumber && errors.trafficGuideNumber
                    }
                  />
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 3, sm: 2 }}
                >
                  <InputDate
                    fullWidth
                    label="Validade Guia Atual"
                    value={formik.values.atualTrafficGuideExpireDate}
                    onChange={(event) =>
                      handleFieldChange("atualTrafficGuideExpireDate", event)
                    }
                    error={Boolean(
                      touched.atualTrafficGuideExpireDate &&
                      errors.atualTrafficGuideExpireDate
                    )}
                    helperText={
                      touched.atualTrafficGuideExpireDate &&
                      errors.atualTrafficGuideExpireDate
                    }
                  />
                  <InputDate
                    fullWidth
                    label="Validade Guia Antiga"
                    value={formik.values.oldTrafficGuideExpireDate}
                    onChange={(event) =>
                      handleFieldChange("oldoldTrafficGuideExpireDate", event)
                    }
                    error={Boolean(
                      touched.oldTrafficGuideExpireDate &&
                      errors.oldTrafficGuideExpireDate
                    )}
                    helperText={
                      touched.oldTrafficGuideExpireDate &&
                      errors.oldTrafficGuideExpireDate
                    }
                  />
                </Stack>
              </>
            )}
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

FormWeapon.propTypes = {
  currentWeapon: PropTypes.object,
  handleClose: PropTypes.func,
};

export default FormWeapon;
