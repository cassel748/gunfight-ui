import React from "react";
import * as Yup from "yup";
import PropTypes from "prop-types";
import { LoadingButton } from "@material-ui/lab";
import { formatCurrency } from "src/utils/string";
import { Form, FormikProvider, useFormik } from "formik";
import {
  Box,
  Card,
  Grid,
  Table,
  TableRow,
  Checkbox,
  TableCell,
  TableHead,
  TableBody,
  TextField,
  Typography,
  TableContainer,
} from "@material-ui/core";
import { useAuthUser } from "next-firebase-auth";
import { useSelector } from "react-redux";
import Toast from "src/utils/toast";

const AmmoCheck = ({ invoiceId, ammunitionsList, handleClose }) => {
  const AuthUser = useAuthUser();
  const userInfo = useSelector((state) => state.user.userInfo);

  const shape = {};
  const initialValues = {};

  for (let i = 0, n = ammunitionsList.length; i < n; i++) {
    shape[`applyDiscount${i}`] = Yup.bool();
    shape[`failCount${i}`] = Yup.number().min(0, "Não pode ser menor que zero");

    initialValues[`applyDiscount${i}`] =
      ammunitionsList[i].applyDiscount || false;
    initialValues[`failCount${i}`] = ammunitionsList[i].failCount || 0;
  }

  const UserAddressSchema = Yup.object().shape(shape);

  const formik = useFormik({
    initialValues,
    validationSchema: UserAddressSchema,
    onSubmit: async (values) => {
      for (let i = 0, n = ammunitionsList.length; i < n; i++) {
        const item = ammunitionsList[i];
        item.applyDiscount = values[`applyDiscount${i}`];
        item.failCount = values[`failCount${i}`];
      }

      const payload = {
        invoiceId,
        modifiedBy: userInfo.id,
        items: ammunitionsList,
      };

      try {
        const token = await AuthUser.getIdToken();
        const response = await fetch("/api/invoice/item?action=AMMO_FAIL", {
          method: "PUT",
          body: JSON.stringify(payload),
          headers: {
            Authorization: token,
          },
        });

        const data = await response.json();

        if (data && data.success) {
          handleClose(true);
          Toast.success("Comanda finalizada e disponível para pagamento!");
        }

        if (data && data.success === false && data.message) {
          Toast.error(data.message);
        }
      } catch (e) {
        console.log(e);
      }
    },
  });

  const { errors, touched, isSubmitting, getFieldProps, values } = formik;
  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off">
        <Card sx={{ pt: 3, pb: 3 }}>
          <Box
            sx={{ mt: 1, ml: 3, display: "flex", justifyContent: "flex-start" }}
          >
            <Typography variant="h5" paragraph>
              Teve alguma falha nas munições?
            </Typography>
          </Box>
          <Card container xs={12} sx={{ mt: 3, mb: 3 }}>
            <TableContainer sx={{ minHeight: 350 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={"3%"}>#</TableCell>
                    <TableCell width={"17%"}>
                      <span style={{ display: "block", textAlign: "left" }}>
                        Item
                      </span>
                    </TableCell>
                    <TableCell width={"13%"}>Quantidade</TableCell>
                    <TableCell width={"7%"}>Subtotal</TableCell>
                    <TableCell width={"7%"}>Desconto</TableCell>
                    <TableCell width={"7%"}>Falhas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ammunitionsList.map((ammunitions, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <span style={{ display: "block", textAlign: "left" }}>
                          {ammunitions.productTitle}
                        </span>
                      </TableCell>
                      <TableCell>{ammunitions.quantity}</TableCell>
                      <TableCell>
                        {formatCurrency(ammunitions.subtotal)}
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          color="primary"
                          {...getFieldProps(`applyDiscount${index}`)}
                          checked={values[`applyDiscount${index}`]}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          type="number"
                          {...getFieldProps(`failCount${index}`)}
                          helperText={
                            touched[`failCount${index}`] &&
                            errors[`failCount${index}`]
                          }
                          error={Boolean(
                            touched[`failCount${index}`] &&
                              errors[`failCount${index}`]
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
          <Grid container justifyContent="flex-end" alignItems="center" pr={3}>
            <Grid item sm={9} xs={12} />

            <Grid item sm={3} xs={12}>
              <LoadingButton
                fullWidth
                size="large"
                type="submit"
                loading={isSubmitting}
                variant="contained"
              >
                Enviar
              </LoadingButton>
            </Grid>
          </Grid>
        </Card>
      </Form>
    </FormikProvider>
  );
};

AmmoCheck.propTypes = {
  invoiceId: PropTypes.string,
  handleClose: PropTypes.func,
  ammunitionsList: PropTypes.array,
};

export default AmmoCheck;
