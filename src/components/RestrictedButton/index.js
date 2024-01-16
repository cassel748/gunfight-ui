import { USER_TYPE_VALUE } from "src/utils/auth";
import { DialogAnimate } from "../animate";
import { Card, Box, Typography, Stack, TextField, InputAdornment, IconButton } from "@material-ui/core";
import * as Yup from "yup";
import { useState } from "react";
import { Icon } from "@iconify/react";
import eyeFill from "@iconify/icons-eva/eye-fill";
import eyeOffFill from "@iconify/icons-eva/eye-off-fill";
import { useFormik, Form, FormikProvider } from "formik";
import { LoadingButton } from "@material-ui/lab";
import Toast from "src/utils/toast";
import { encryptData } from 'src/utils/crypto';
import { apiFetch } from "src/utils/apiFetch";
import { useSelector } from "react-redux";
import { getEnumTitle } from "src/utils/enums";

export function RestrictedButton({
  requiredAccessLevel,
  shouldHide = false,
  onClick,
  loading,
  children,
  icon = false,
  ...props
}) {
  const [isOpenNewDialog, setIsOpenNewDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const userInfo = useSelector((state) => state.user.userInfo);

  if (userInfo && userInfo.accessLevel < requiredAccessLevel && shouldHide) return null

  const closeNewDialog = () => {
    setIsOpenNewDialog(false);
  };

  const openNewDialog = () => {
    if (userInfo && userInfo.accessLevel < requiredAccessLevel) {
      return setIsOpenNewDialog(true);
    }

    onClick();
  }

  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .email("E-mail deve ser um endereço de e-mail válido")
      .required("E-mail obrigatório"),
    password: Yup.string().required("Senha obrigatória"),
  });

  const formik = useFormik({
    initialValues: {
      email: "adm@gunfight.app",
      password: "",
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      try {
        const encryptedPassword = encryptData(values.password);

        const data = await apiFetch("/login-admin", {
          email: values.email,
          password: encryptedPassword,
        }, "POST");

        if (data && data.success) {
          Toast.success("Login feito com sucesso!");
          closeNewDialog()
          onClick();
        }

        if (data && !data.success) {
          Toast.error(data.message);
        }
      } catch (err) {
        Toast.error(err.message);
        console.log(err);
      }
    },
  });

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const { errors, touched, isSubmitting, getFieldProps } = formik;

  const ButtonElement = icon ? IconButton : LoadingButton;

  return (
    <>
      <ButtonElement
        loading={loading}
        onClick={openNewDialog}
        {...props}
      >
        {children}
      </ButtonElement>

      <DialogAnimate open={isOpenNewDialog}
        onClose={closeNewDialog}
        widthMax={440}
      >
        <Card sx={{ p: 3 }}>
          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-start" }}>
            <Box>
              <Typography variant="h5" paragraph>
                Login Administrador
              </Typography>
              <Typography paragraph>
                Essa ação requer o login de um {getEnumTitle(USER_TYPE_VALUE, requiredAccessLevel)}
              </Typography>
            </Box>
          </Box>
          <FormikProvider value={formik}>
            <Form autoComplete="new-password" noValidate>
              <Stack spacing={3} my={2} mt={0}>
                {errors.afterSubmit && (
                  <Alert severity="error">{errors.afterSubmit}</Alert>
                )}

                <div style={{ height: 0, overflow: "hidden" }}>
                  <input type="email" name="email" style={{ height: 0, padding: 0, border: 0 }} />
                  <input type="password" name="password" autoComplete="new-password" style={{ height: 0, padding: 0, border: 0 }} />
                </div>

                <TextField
                  fullWidth
                  type="email"
                  label="E-mail"
                  
                  autoComplete="new-password"
                  {...getFieldProps("email")}
                  error={Boolean(touched.email && errors.email)}
                  helperText={touched.email && errors.email}
                />

                <TextField
                  fullWidth
                  label="Senha"
                  autoComplete="new-password"
                  type={showPassword ? "text" : "password"}
                  {...getFieldProps("password")}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleShowPassword} edge="end">
                          <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  error={Boolean(touched.password && errors.password)}
                  helperText={touched.password && errors.password}
                  autoFocus={true}
                />
              </Stack>
              <LoadingButton
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                Entrar
              </LoadingButton>
            </Form>
          </FormikProvider>
        </Card>
      </DialogAnimate>
    </>
  );
}
