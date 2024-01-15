import React, { useCallback, useState } from "react";
import * as Yup from "yup";
import PropTypes from "prop-types";
import Toast from "src/utils/toast";
import { Icon } from "@iconify/react";

import { Switch } from "@material-ui/core";
import { LoadingButton } from "@material-ui/lab";
import eyeFill from "@iconify/icons-eva/eye-fill";
import { Form, FormikProvider, useFormik } from "formik";
import eyeOffFill from "@iconify/icons-eva/eye-off-fill";
import InputCellphone from "src/components/InputCellphone";
import {
  Box,
  Card,
  Stack,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  FormControlLabel,
} from "@material-ui/core";
import { useAuthUser } from "next-firebase-auth";
import UploadAvatar from "src/components/UploadAvatar";
import firebase from "firebase/app";
import { USER_TYPE_VALUE, generateId } from "src/utils/auth";
import Firebase from "src/utils/firebase";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "src/features/user/userSlice";

const FormNewUser = ({ currentUser, onClose }) => {
  const dispatch = useDispatch();
  const isNew =
    currentUser === undefined || (currentUser && !currentUser.docId);

  const AuthUser = useAuthUser();
  const userInfo = useSelector((state) => state.user.userInfo);

  const [userPhoto, setUserPhoto] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [userId] = useState(isNew ? generateId() : currentUser?.docId);

  const [filePreview, setFilePreview] = useState(
    currentUser?.userPhoto
      ? currentUser?.userPhoto
      : "/static/mock-images/avatars/avatar.jpg"
  );

  const UserAddressSchema = Yup.object().shape({
    name: Yup.string().required("Nome obrigatório"),
    email: Yup.string()
      .email("Insira um e-mail válido")
      .required("Email obrigatório"),
    phoneNumber: Yup.string(),
    accessLevel: Yup.string().required("Tipo obrigatório"),
    password: Yup.string().when("name", (name) => {
      if (!name) {
        return Yup.string().required("Senha obrigatória");
      }
    }),
    active: Yup.boolean(),
  });

  const handleUpdateUser = async (values, downloadUrl, fileStorageId) => {
    try {
      const token = await AuthUser.getIdToken();
      const response = await fetch("/api/user", {
        method: "PUT",
        body: JSON.stringify({
          ...values,
          userPhoto: currentUser?.userPhoto
            ? currentUser?.userPhoto
            : downloadUrl,
          userPhotoStorageId: currentUser?.userPhotoStorageId
            ? currentUser?.userPhotoStorageId
            : fileStorageId,
          modifiedBy: userInfo.id,
          docId: currentUser?.docId,
        }),
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();

      if (data && data.code === "auth/invalid-password") {
        Toast.error("A senha deve conter pelo menos 6 caracteres!");
      }

      if (data && data.success) {
        Toast.success("Usuário alterado com sucesso!");
        onClose(true);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      accessLevel: currentUser?.accessLevel || "",
      password: currentUser?.password || "",
      phoneNumber: currentUser?.phoneNumber || "",
      active: currentUser?.active || "",
    },

    validationSchema: UserAddressSchema,
    onSubmit: async (values) => {
      try {
        let downloadUrl = null;
        const fileStorageId = `user-photos/${userId}`;

        if (userPhoto && userPhoto.path) {
          const storageRef = firebase.storage().ref();
          const documentsRef = storageRef.child(fileStorageId);

          const fileStorage = await documentsRef.put(userPhoto, {
            contentType: userPhoto.type,
          });

          downloadUrl = await fileStorage.ref.getDownloadURL();
        }
        if (!isNew) {
          const data = await Firebase.getDataById("user-data", userId);

          dispatch(setUser(data));
        }

        if (currentUser?.docId) {
          return handleUpdateUser(values, downloadUrl, fileStorageId);
        }

        const token = await AuthUser.getIdToken();
        const response = await fetch("/api/user", {
          method: "POST",
          body: JSON.stringify({
            ...values,
            userPhoto: downloadUrl,
            userPhotoStorageId: fileStorageId,
            createdBy: userInfo.id,
          }),
          headers: {
            Authorization: token,
          },
        });

        const data = await response.json();

        if (data && data.code === "auth/email-already-exists") {
          Toast.error("Email já cadastrado!");
        }

        if (data && data.code === "auth/invalid-password") {
          Toast.error("A senha deve conter pelo menos 6 caracteres!");
        }

        if (data && data.success) {
          Toast.success("Usuário cadastrado com sucesso!");
          onClose(true);
        }
      } catch (err) {
        console.log(err);
      }
    },
  });

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const { errors, touched, isSubmitting, getFieldProps, values } = formik;

  const handleChangeActive = () => {
    const value = !values.active;
    formik.setFieldValue("active", value);
  };

  const handleDropSingleFile = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFilePreview(URL.createObjectURL(file));
      setUserPhoto(file);
    }
  }, []);

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate>
        <Card sx={{ p: 3 }}>
          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-start" }}>
            <Typography variant="h5" paragraph>
              {currentUser?.name ? "Editar" : "Novo"} Usuário
            </Typography>
          </Box>

          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
              mb={4}
            >
              <UploadAvatar
                accept="image/*"
                file={filePreview}
                maxSize={3145728}
                onDrop={handleDropSingleFile}
              />
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField
                fullWidth
                label="Nome"
                {...getFieldProps("name")}
                error={Boolean(touched.name && errors.name)}
                helperText={touched.name && errors.name}
              />
              <InputCellphone
                fullWidth
                label="Número de telefone"
                {...getFieldProps("phoneNumber")}
                error={Boolean(touched.phoneNumber && errors.phoneNumber)}
                helperText={touched.phoneNumber && errors.phoneNumber}
              />
              <TextField
                select
                fullWidth
                label="Tipo de Usuário"
                {...getFieldProps("accessLevel")}
                error={Boolean(touched.accessLevel && errors.accessLevel)}
                helperText={touched.accessLevel && errors.accessLevel}
                disabled={userInfo.accessLevel <= 2}
              >
                {USER_TYPE_VALUE.map((option) => (
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
              <TextField
                fullWidth
                label="E-mail"
                {...getFieldProps("email")}
                error={Boolean(touched.email && errors.email)}
                helperText={touched.email && errors.email}
                disabled={currentUser?.email}
              />
              <TextField
                fullWidth
                label="Senha"
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                {...getFieldProps("password")}
                error={Boolean(touched.password && errors.password)}
                helperText={touched.password && errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleShowPassword} edge="end">
                        <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {currentUser?.name && (
                <FormControlLabel
                  label="Ativo"
                  {...getFieldProps("active")}
                  checked={values.active}
                  onChange={handleChangeActive}
                  sx={{ ml: 4, mt: 1 }}
                  labelPlacement="end"
                  control={<Switch size="normal" />}
                />
              )}
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
                variant="outlined"
                onClick={() => onClose(false)}
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

FormNewUser.propTypes = {
  currentUser: PropTypes.object,
  handleClose: PropTypes.func,
};

export default FormNewUser;
