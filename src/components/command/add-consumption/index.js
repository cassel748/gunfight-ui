import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import PropTypes from "prop-types";
import { LoadingButton } from "@material-ui/lab";
import { Form, FormikProvider, getIn, useFormik } from "formik";
import { ORIGIN_WEAPON } from "src/utils/enums";
import {
  Box,
  Card,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Button,
} from "@material-ui/core";
import { useAuthUser } from "next-firebase-auth";
import ProductAutocomplete from "src/components/ProductAutocomplete";
import UserAutocomplete from "src/components/UserAutocomplete";
import Toast from "src/utils/toast";
import { useSelector } from "react-redux";
import { formatCurrency } from "src/utils/string";
import styles from "./AddConsumption.module.css";
import InputCurrency from "src/components/InputCurrency";
import firebase from "firebase/app";
import "firebase/firestore";

let lastPercentageUsed = null;

const AddConsumption = ({
  currentConsumption,
  cancelConsumptionAdd,
  associateId,
  invoiceId,
  handleClose,
}) => {
  const AuthUser = useAuthUser();
  const userInfo = useSelector((state) => state.user.userInfo);

  const [weaponsList, setWeaponsList] = useState([]);
  const [productType, setProductType] = useState([]);
  const [armamentOrigin, setArmamentOrigint] = useState(null);
  const [product, setProduct] = useState({});
  const [user, setUser] = useState({});
  const [originWeapon, setOriginWeapon] = useState(0);

  useEffect(() => {
    return () => {
      setProduct(null);
    };
  }, []);

  useEffect(() => {
    if (
      currentConsumption &&
      currentConsumption.productTitle &&
      currentConsumption.productId
    ) {
      AuthUser.getIdToken().then((token) => {
        fetch(
          `/api/internal/products?search=${currentConsumption.productTitle}`,
          {
            method: "GET",
            headers: {
              Authorization: token,
            },
          }
        )
          .then((response) => {
            response.json().then((data) => {
              if (data && data.success && data.hits && data.hits.length) {
                let p =
                  data.hits.find(
                    (hit) => hit.objectID === currentConsumption.productId
                  ) || data.hits[0];

                setProduct(p);
                setProductType(p.type);
              }
            });
          })
          .catch((reason) => {
            Toast.error("Produto não identificado!");
          });
      });
    }
  }, [currentConsumption]);

  const shape = {
    productId: Yup.string().required("Escolha um produto"),
    armamentOrigin: Yup.string().when("productId", {
      is: (value) => value && productType === 2,
      then: Yup.string().required("Origem do armamento é obrigatório"),
      otherwise: Yup.string(),
    }),
    /*armament: Yup.string().when("productId", {
    is: (value) => value && productType === 2,
    then: Yup.string().required("Armamento utilizado é obrigatório"),
    otherwise: Yup.string()
  }),*/
    armament: Yup.string().when("armamentOrigin", {
      is: (value) => value && armamentOrigin === 1,
      then: Yup.string(),
      otherwise: Yup.string(),
    }),
    quantity: Yup.number()
      .min(1, "Quantidade não pode ser menor que um.")
      .required("Quantidade obrigatória."),
    sellerId: Yup.string().required("Vendedor(a) obrigatório."),
    applyDiscount: Yup.bool(),
    failCount: Yup.number().min(0, "Não pode ser menor que zero."),
    gunDetail: Yup.string(),
    modelWeapon: Yup.string(),
    serialNumber: Yup.string(),
    transferOf: Yup.string(),
    transferTo: Yup.string(),
  };

  const initialValues = {
    productId: currentConsumption?.productId || "",
    armamentOrigin: currentConsumption?.weaponOrigin || "",
    armament: currentConsumption?.weaponId || "Armamento",
    quantity: currentConsumption?.quantity || "",
    sellerId: currentConsumption?.sellerId || "",
    applyDiscount: currentConsumption?.applyDiscount || false,
    failCount: currentConsumption?.failCount || 0,
    itemDiscount: currentConsumption?.itemDiscount || 0,
    gunDetail: currentConsumption?.gunDetail || "",
    modelWeapon: currentConsumption?.modelWeapon || "",
    serialNumber: currentConsumption?.serialNumber || "",
    transferOf: currentConsumption?.transferOf || "",
    transferTo: currentConsumption?.transferTo || "",
  };

  const UserAddressSchema = Yup.object().shape(shape);

  const formik = useFormik({
    initialValues,
    validationSchema: UserAddressSchema,
    onSubmit: async (values) => {
      try {
        const token = await AuthUser.getIdToken();

        if (currentConsumption && currentConsumption.productId) {
          const response = await fetch("/api/invoice/item", {
            method: "PUT",
            body: JSON.stringify({
              invoiceId,
              quantity: values.quantity,
              failCount: values.failCount,
              docId: currentConsumption.docId,
              productPrice: product.price,
              applyDiscount: values.applyDiscount,
              itemDiscount: parseFloat(values.itemDiscount),
              modifiedBy: userInfo.id,
            }),
            headers: {
              Authorization: token,
            },
          });

          const data = await response.json();

          if (data && data.success) {
            handleClose(true);
            Toast.success("Item atualizado com sucesso!");
          }

          if (data && data.success === false && data.message) {
            Toast.error(data.message);
          }
        } else {
          const response = await fetch("/api/invoice/item", {
            method: "POST",
            body: JSON.stringify({
              invoiceId,
              quantity: values.quantity,
              productPrice: product.price,
              sellerId: values.sellerId,
              sellerName: user.name,
              productTitle: product.title,
              productType: productType,
              productId: values.productId,
              weaponOrigin: values.armamentOrigin,
              weaponId: values.armament,
              createdBy: userInfo.id,
              failCount: values.failCount,
              gunDetail: values.gunDetail,
              modelWeapon: values.modelWeapon,
              serialNumber: values.serialNumber,
              transferOf: values.transferOf,
              transferTo: values.transferTo,
              applyDiscount: values.applyDiscount,
              itemDiscount: parseFloat(values.itemDiscount),
            }),
            headers: {
              Authorization: token,
            },
          });

          const data = await response.json();

          if (data && data.success) {
            const db = firebase.firestore();
            const snapshots = await db
              .collection("invoice-items")
              .where("invoiceId", "==", invoiceId)
              .get();

            let alreadyHavePersonal = false;
            snapshots.forEach((doc) => {
              const item = doc.data();
              if (
                item &&
                item.productTitle.toLowerCase().indexOf("aula de personal") >
                  -1 &&
                item.status === "A"
              ) {
                alreadyHavePersonal = true;
              }
            });

            if (
              product.type === 2 &&
              product.title.toLowerCase().indexOf("personal") > -1 &&
              alreadyHavePersonal === false
            ) {
              return addTrainingItem(values);
            }

            handleClose(true);
            Toast.success("Item adicionado com sucesso!");
          }

          if (data && data.success === false && data.message) {
            Toast.error(data.message);
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
  });

  const { errors, touched, isSubmitting, getFieldProps, values } = formik;

  const onChangeField = (fieldName) => (event) => {
    const value = event.target.value;
    formik.setFieldValue(fieldName, value);
  };

  const onSelectProduct = (product) => {
    setProduct(product);
    setProductType(product.type);
  };

  const addTrainingItem = async (values) => {
    const db = firebase.firestore();
    const snapshots = await db
      .collection("internal-products")
      .where("title", "==", "AULA DE PERSONAL")
      .get();

    const products = [];
    snapshots.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    if (products && products.length) {
      const localProduct = products[0];
      const token = await AuthUser.getIdToken();
      const response = await fetch("/api/invoice/item", {
        method: "POST",
        body: JSON.stringify({
          invoiceId,
          quantity: 1,
          productPrice: localProduct.price,
          sellerId: values.sellerId,
          sellerName: user.name,
          productTitle: localProduct.title,
          productType: localProduct.type,
          productId: values.productId,
          weaponOrigin: values.armamentOrigin,
          weaponId: values.armament,
          createdBy: userInfo.id,
          failCount: 0,
          applyDiscount: false,
          itemDiscount: 0,
        }),
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();

      if (data && data.success) {
        handleClose(true);
        Toast.success("Item adicionado com sucesso!");
      }
    } else {
      Toast.error(
        "O valor da aula não foi incluido. Verifique se existe um produto cadastrado com o titulo AULA DE PERSONAL",
        { duration: 6000 }
      );
    }
  };

  const onSelectUser = (user) => {
    setUser(user);
  };

  const clubWeaponsSearch = async () => {
    try {
      let url = "/api/internal/weapons";

      const token = await AuthUser.getIdToken();
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();
      setWeaponsList(data);
    } catch (e) {
      console.log(e);
      setWeaponsList([]);
    }
  };

  const associateWeaponsSearch = async () => {
    try {
      let url = `/api/associate/weapons?associateId=${associateId}`;

      const token = await AuthUser.getIdToken();
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();
      setWeaponsList(data);
    } catch (e) {
      console.log(e);
      setWeaponsList([]);
    }
  };

  const onClickOriginWeapon = (value) => {
    if (value === 1) {
      clubWeaponsSearch();
    }

    if (value === 2) {
      associateWeaponsSearch();
    }

    formik.setFieldValue("armament", "");
    setArmamentOrigint(value);
  };

  const getItemDiscount = (formatted = true) => {
    let itemDiscount = formik.values.itemDiscount
      ? formik.values.itemDiscount
      : 0;
    return formatted ? formatCurrency(itemDiscount) : itemDiscount;
  };

  const getFailDiscount = (formatted = true) => {
    if (!formik.values.applyDiscount) {
      return formatted ? formatCurrency(0) : 0;
    }

    const failCount = formik.values.failCount;
    const discount = failCount * product.price;
    return formatted ? formatCurrency(discount) : discount;
  };

  const getItemTotal = (formatted = true, applyItemDiscount) => {
    let total = product.price * formik.values.quantity;
    const failDiscount = getFailDiscount(false);
    const itemDiscount = formik.values.itemDiscount;

    if (failDiscount) {
      total = total - failDiscount;
    }

    if (applyItemDiscount && itemDiscount) {
      total = total - itemDiscount;
    }

    return formatted ? formatCurrency(total) : total;
  };

  const applyDiscount = (percentage, fromCheckbox) => {
    if (fromCheckbox && !formik.values.itemDiscount) {
      return;
    }

    const total = getItemTotal(false);
    formik.setFieldValue("itemDiscount", total * percentage);
    lastPercentageUsed = percentage;
  };

  const applyDiscountField = getIn(values, "applyDiscount");

  useEffect(() => {
    if (lastPercentageUsed) {
      applyDiscount(lastPercentageUsed, true);
    }
  }, [applyDiscountField]);

  const onKeyDownItemDiscount = () => {
    lastPercentageUsed = null;
  };

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off">
        <Card sx={{ p: 3 }}>
          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-start" }}>
            <Typography variant="h5">
              {" "}
              {currentConsumption && currentConsumption.productId
                ? "Atualizar"
                : "Adicionar"}{" "}
              consumo
            </Typography>
          </Box>
          <Grid container spacing={3} mt={1}>
            <Grid item sm={12} xs={12}>
              {currentConsumption &&
              currentConsumption.productTitle &&
              currentConsumption.productId ? (
                <TextField
                  fullWidth
                  type="text"
                  label="Produto"
                  InputLabelProps={{ shrink: true }}
                  disabled={true}
                  value={currentConsumption.productTitle}
                />
              ) : (
                <ProductAutocomplete
                  fullWidth
                  label="Produto"
                  onChange={onChangeField("productId")}
                  onSelect={onSelectProduct}
                  error={Boolean(touched.productId && errors.productId)}
                  helperText={touched.productId && errors.productId}
                />
              )}
            </Grid>
            {product?.type === 14 ||
            product?.objectID === "YEEWPUJxPDw00Po9vTQy" ? (
              <Grid item sm={12} xs={12}>
                {currentConsumption &&
                currentConsumption.productTitle &&
                currentConsumption.productId ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    disabled={true}
                    label="Detalhes da Arma"
                    {...getFieldProps("gunDetail")}
                    error={Boolean(touched.gunDetail && errors.gunDetail)}
                    helperText={touched.gunDetail && errors.gunDetail}
                  />
                ) : (
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Detalhes da Arma"
                    {...getFieldProps("gunDetail")}
                    error={Boolean(touched.gunDetail && errors.gunDetail)}
                    helperText={touched.gunDetail && errors.gunDetail}
                  />
                )}
              </Grid>
            ) : (
              <></>
            )}
            {product?.type === 15 && (
              <>
                <Grid item sm={6} xs={12}>
                  {currentConsumption &&
                  currentConsumption.productTitle &&
                  currentConsumption.productId ? (
                    <TextField
                      fullWidth
                      disabled={true}
                      label="Modelo da Arma"
                      {...getFieldProps("modelWeapon")}
                      error={Boolean(touched.modelWeapon && errors.modelWeapon)}
                      helperText={touched.modelWeapon && errors.modelWeapon}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      label="Modelo da Arma"
                      {...getFieldProps("modelWeapon")}
                      error={Boolean(touched.modelWeapon && errors.modelWeapon)}
                      helperText={touched.modelWeapon && errors.modelWeapon}
                    />
                  )}
                </Grid>
                <Grid item sm={6} xs={12}>
                  {currentConsumption &&
                  currentConsumption.productTitle &&
                  currentConsumption.productId ? (
                    <TextField
                      fullWidth
                      disabled={true}
                      label="Número de série"
                      {...getFieldProps("serialNumber")}
                      error={Boolean(
                        touched.serialNumber && errors.serialNumber
                      )}
                      helperText={touched.serialNumber && errors.serialNumber}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      label="Número de série"
                      {...getFieldProps("serialNumber")}
                      error={Boolean(
                        touched.serialNumber && errors.serialNumber
                      )}
                      helperText={touched.serialNumber && errors.serialNumber}
                    />
                  )}
                </Grid>
                <Grid item sm={6} xs={12}>
                  {currentConsumption &&
                  currentConsumption.productTitle &&
                  currentConsumption.productId ? (
                    <TextField
                      fullWidth
                      disabled={true}
                      label="De"
                      {...getFieldProps("transferOf")}
                      error={Boolean(touched.transferOf && errors.transferOf)}
                      helperText={touched.transferOf && errors.transferOf}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      label="De"
                      {...getFieldProps("transferOf")}
                      error={Boolean(touched.transferOf && errors.transferOf)}
                      helperText={touched.transferOf && errors.transferOf}
                    />
                  )}
                </Grid>
                <Grid item sm={6} xs={12}>
                  {currentConsumption &&
                  currentConsumption.productTitle &&
                  currentConsumption.productId ? (
                    <TextField
                      fullWidth
                      disabled={true}
                      label="Para"
                      {...getFieldProps("transferTo")}
                      error={Boolean(touched.transferTo && errors.transferTo)}
                      helperText={touched.transferTo && errors.transferTo}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      label="Para"
                      {...getFieldProps("transferTo")}
                      error={Boolean(touched.transferTo && errors.transferTo)}
                      helperText={touched.transferTo && errors.transferTo}
                    />
                  )}
                </Grid>
              </>
            )}

            <Grid item sm={4} xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Quantidade"
                {...getFieldProps("quantity")}
                disabled={currentConsumption && currentConsumption.productId}
                helperText={touched.quantity && errors.quantity}
                error={Boolean(touched.quantity && errors.quantity)}
              />
            </Grid>
            <Grid item sm={8} xs={12}>
              {currentConsumption &&
              currentConsumption.sellerId &&
              currentConsumption.sellerName ? (
                <TextField
                  fullWidth
                  type="text"
                  label="Vendedor"
                  InputLabelProps={{ shrink: true }}
                  disabled={true}
                  value={currentConsumption.sellerName}
                />
              ) : (
                <UserAutocomplete
                  fullWidth
                  label="Vendedor"
                  onChange={onChangeField("sellerId")}
                  onSelect={onSelectUser}
                  error={Boolean(touched.sellerId && errors.sellerId)}
                  helperText={touched.sellerId && errors.sellerId}
                />
              )}
            </Grid>
            {productType === 2 && (
              <>
                <Grid item sm={4} xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Origem Armamento"
                    {...getFieldProps("armamentOrigin")}
                    error={Boolean(
                      touched.armamentOrigin && errors.armamentOrigin
                    )}
                    disabled={
                      currentConsumption && currentConsumption.productId
                    }
                    helperText={touched.armamentOrigin && errors.armamentOrigin}
                  >
                    {ORIGIN_WEAPON.map((option) => (
                      <MenuItem
                        key={option.value}
                        value={option.value}
                        onClick={() => {
                          onClickOriginWeapon(option.value);
                          setOriginWeapon(option.value);
                        }}
                      >
                        {option.title}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                {/* <Grid item sm={8} xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Armamento"
                    {...getFieldProps("armament")}
                    error={Boolean(touched.armament && errors.armament)}
                    helperText={touched.armament && errors.armament}
                  >
                    {!weaponsList && (
                      <MenuItem>Nenhum item encontrado</MenuItem>
                    )}
                    {weaponsList?.map((option, index) => (
                      <MenuItem key={index} value={option.docId}>
                        {option.brand} {`\b`}
                        {option.model} {`\b`}
                        {option.caliber}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid> */}

                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Falhas"
                    {...getFieldProps("failCount")}
                    // helperText={touched[`failCount`] && errors[`failCount`]}
                    // error={Boolean(
                    //   touched[`failCount`] && errors[`failCount`]
                    // )}
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        {...getFieldProps("applyDiscount")}
                        checked={formik.values.applyDiscount}
                      />
                    }
                    label="Descontar falhas"
                  />
                </Grid>
              </>
            )}

            {product && product.price && (
              <Grid item xs={4} style={{ paddingLeft: 0, marginLeft: 20 }}>
                <InputCurrency
                  style={{
                    width: "100%",
                    marginRight: 8,
                    marginBottom: 12,
                  }}
                  label="Desconto Item"
                  {...getFieldProps("itemDiscount")}
                  error={Boolean(touched.itemDiscount && errors.itemDiscount)}
                  helperText={touched.itemDiscount && errors.itemDiscount}
                  disabled={!formik.values.quantity}
                  onKeyPress={onKeyDownItemDiscount}
                />
                <Button
                  disabled={!formik.values.quantity}
                  variant="outlined"
                  style={{ height: 45, marginRight: 8, width: "30%" }}
                  onClick={() => applyDiscount(0.05)}
                >
                  5%
                </Button>

                <Button
                  disabled={!formik.values.quantity}
                  variant="outlined"
                  style={{ height: 45, marginRight: 8, width: "31%" }}
                  onClick={() => applyDiscount(0.07)}
                >
                  7%
                </Button>

                <Button
                  disabled={!formik.values.quantity}
                  variant="outlined"
                  style={{ height: 45, width: "31%" }}
                  onClick={() => applyDiscount(0.1)}
                >
                  10%
                </Button>
              </Grid>
            )}

            {product && product.price && (
              <>
                <div className={styles.itemOverview}>
                  <Grid container>
                    <Grid
                      item
                      xs={4}
                      display={"flex"}
                      justifyContent={"center"}
                    >
                      {product.type === 2 && <span>Desconto Falhas</span>}
                    </Grid>
                    <Grid
                      item
                      xs={4}
                      display={"flex"}
                      justifyContent={"center"}
                    >
                      Desconto Item
                    </Grid>
                    <Grid
                      item
                      xs={4}
                      display={"flex"}
                      justifyContent={"center"}
                    >
                      Total
                    </Grid>
                  </Grid>
                </div>

                <Grid container spacing={2} className={styles.itemOverviewGrid}>
                  <Grid item xs={4} display={"flex"} justifyContent={"center"}>
                    {product.type === 2 && (
                      <span>
                        <h4>{getFailDiscount()}</h4>
                      </span>
                    )}
                  </Grid>
                  <Grid item xs={4} display={"flex"} justifyContent={"center"}>
                    <h4>{getItemDiscount()}</h4>
                  </Grid>
                  <Grid item xs={4} display={"flex"} justifyContent={"center"}>
                    <h4>{getItemTotal(true, true)}</h4>
                  </Grid>
                </Grid>
              </>
            )}

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
                >
                  {currentConsumption && currentConsumption.productId
                    ? "Atualizar"
                    : "Adicionar"}
                </LoadingButton>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      </Form>
    </FormikProvider>
  );
};

AddConsumption.propTypes = {
  handleClose: PropTypes.func,
  cancelConsumptionAdd: PropTypes.func,
};

export default AddConsumption;
