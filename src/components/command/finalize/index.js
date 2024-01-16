import React from "react";
import * as Yup from "yup";
import PropTypes from "prop-types";
import { LoadingButton } from "@material-ui/lab";
import { Form, FormikProvider, useFormik } from "formik";
import {
  Box,
  Card,
  Grid,
  MenuItem,
  TextField,
  Typography,
  DialogContent,
  DialogContentText,
} from "@material-ui/core";
import { formatCurrency } from "src/utils/string";
import InputCurrency from "src/components/InputCurrency";
import { Button } from "@material-ui/core";
import { useAuthUser } from "next-firebase-auth";
import Toast from "src/utils/toast";
import { useSelector } from "react-redux";
import {
  EVENT_TYPE,
  FINANCIAL_OPERATION_ENUM,
  getPaymentFormIcon,
  MUST_CONTAIN_CALIBER_NUMBER,
  PAYMENT_METHODS,
} from "src/utils/enums";

const CommandFinalize = ({ invoiceData, associateData, handleClose, invoiceItems }) => {
  const AuthUser = useAuthUser();
  const userInfo = useSelector((state) => state.user.userInfo);
  const UserAddressSchema = Yup.object().shape({
    paymentForm: Yup.string().required("Forma de pagamento"),
    observation: Yup.string(),
  });

  const filteredProducts = invoiceItems.filter(item => MUST_CONTAIN_CALIBER_NUMBER.includes(item.productType));

  const formik = useFormik({
    initialValues: {
      paymentForm: invoiceData?.paymentForm || "",
      observation: invoiceData?.observation || "",
      // paymentDiscount: invoiceData.discount || 0,
      paymentDiscount: 0,
    },
    validationSchema: UserAddressSchema,
    onSubmit: async (values) => {
      try {
        const token = await AuthUser.getIdToken();
        const response = await fetch("/api/invoice?action=FINISH", {
          method: "PUT",
          body: JSON.stringify({
            ...values,
            docId: invoiceData.id || invoiceData.docId,
            finishedBy: userInfo.id,
          }),
          headers: {
            Authorization: token,
          },
        });

        const data = await response.json();

        if (data && data.success) {
          if (values.paymentForm === 5) {
            try {
              const values = {
                value: Number(invoiceData?.total || 0),
                type: FINANCIAL_OPERATION_ENUM.DEBIT,
                description: `Pagamento comanda ${invoiceData?.invoiceId}`,
                date: new Date(),
                quantity: 1,
                subtotal: Number(invoiceData?.subtotal || 0),
              };

              const body = {
                ...values,
                associateId: invoiceData?.associateId,
                createdBy: invoiceData?.sellerId,
              };

              const responseWallet = await fetch("/api/associate/wallet", {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                  Authorization: token,
                },
              });

              const dataWallet = await responseWallet.json();

              if (dataWallet && dataWallet.success) {
                Toast.success("Transação cadastrada com sucesso!");
              }
            } catch (err) {
              console.log(err);
            }
          }

          Toast.success("Comanda paga com sucesso!");
          handleClose(true);
        }

        if (data && data.success === false && data.message) {
          Toast.error(data.message);
        }
      } catch (e) {
        console.log(e);
      }
    },
  });

  const { errors, touched, isSubmitting, getFieldProps } = formik;

  const applyDiscount = (percentage) => {
    const total = invoiceData.total - invoiceData.discount;
    formik.setFieldValue("paymentDiscount", total * percentage);
  };

  // id da "Anuidade" === p0Kp2MqhIek1Yp8oEjw0

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off">
        <Card sx={{ pt: 3, pl: 3 }}>
          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-start" }}>
            <Typography variant="h5">Finalizar Pagamento</Typography>
          </Box>

          <Grid container spacing={3} mt={1}>
            <DialogContent>
              <Grid
                container
                spacing={9}
                direction={{ xs: "column", sm: "row" }}
              >
                <Grid item sm={5} xs={12}>
                  <Box>
                    <Typography variant="subtitle2">
                      Número da Comanda
                    </Typography>
                    <DialogContentText>
                      {invoiceData.invoiceId}
                    </DialogContentText>
                  </Box>
                </Grid>
                <Grid item sm={7} xs={12}>
                  <Box>
                    <Typography variant="subtitle2">
                      Associado - &nbsp;
                      {associateData.affiliationNumber ||
                        associateData.associateNumber}
                    </Typography>
                    <DialogContentText>
                      {associateData.name || associateData.associateName}
                    </DialogContentText>
                  </Box>
                </Grid>
              </Grid>

              <Grid container spacing={3}>
                <Grid item sm={6} xs={12}>
                  <Box>
                    <Typography variant="subtitle2">Valor</Typography>
                    <DialogContentText>
                      {formatCurrency(invoiceData.total)}
                    </DialogContentText>
                  </Box>
                </Grid>
              </Grid>

              {filteredProducts.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>SIGMA</th>
                      <th>Tipo Evento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => (
                      <tr>
                        <td>{product.productTitle}</td>

                        <td><input></input></td>

                        <td>
                          <select>
                            {EVENT_TYPE.map(item => (
                              <option value={item.value}>{item.title}</option>  
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>  
              )}

              <Grid container spacing={3}>
                <Grid item sm={12} xs={12} mt={2}>
                  <TextField
                    select
                    fullWidth
                    label="Forma de Pagamento"
                    {...getFieldProps("paymentForm")}
                    error={Boolean(touched.paymentForm && errors.paymentForm)}
                    helperText={touched.paymentForm && errors.paymentForm}
                  >
                    {PAYMENT_METHODS.map((option) => (
                      <MenuItem
                        key={option.value}
                        value={option.value}
                        style={{
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        {option.title}
                        {getPaymentFormIcon(option.value)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                {/* <Grid item sm={12} xs={12} mt={2} justifyContent="space-between" style={{ display: "flex" }}>
                  <InputCurrency
                    style={{ width: "60%", marginRight: 8 }}
                    label="Desconto"
                    {...getFieldProps("paymentDiscount")}
                    error={Boolean(touched.paymentDiscount && errors.paymentDiscount)}
                    helperText={touched.paymentDiscount && errors.paymentDiscount}
                  />
                  <Button variant="outlined" style={{ height: 45, marginRight: 8 }} onClick={() => applyDiscount(0.05)}>5%</Button>
                  <Button variant="outlined" style={{ height: 45, marginRight: 8 }} onClick={() => applyDiscount(0.07)}>7%</Button>
                  <Button variant="outlined" style={{ height: 45 }} onClick={() => applyDiscount(0.10)}>10%</Button>
                </Grid> */}
                <Grid
                  item
                  sm={12}
                  xs={12}
                  mt={2}
                  justifyContent="space-between"
                  style={{ display: "flex" }}
                >
                  <TextField
                    fullWidth
                    multiline
                    label="Observações da comanda"
                    rows={3}
                    {...getFieldProps("observation")}
                  />
                </Grid>
              </Grid>
              <Grid container direction="row" spacing={2}>
                <Grid item sm={6} xs={12} />
                <Grid item sm={3} xs={12} mt={3}>
                  <LoadingButton
                    fullWidth
                    variant="outlined"
                    onClick={handleClose}
                    loading={isSubmitting}
                  >
                    Cancelar
                  </LoadingButton>
                </Grid>
                <Grid item sm={3} xs={12} mt={3}>
                  <LoadingButton
                    fullWidth
                    type="submit"
                    variant="contained"
                    loading={isSubmitting}
                  >
                    Finalizar
                  </LoadingButton>
                </Grid>
              </Grid>
            </DialogContent>
          </Grid>
        </Card>
      </Form>
    </FormikProvider>
  );
};

CommandFinalize.propTypes = {
  invoiceData: PropTypes.object,
  associateData: PropTypes.object,
  handleClose: PropTypes.func,
};

export default CommandFinalize;
