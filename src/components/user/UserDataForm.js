import * as Yup from "yup";
import InputCpf from "../InputCpf";
import PropTypes from "prop-types";
import Toast from "src/utils/toast";
import firebase from "firebase/app";
import InputDate from "../InputDate";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { printFile } from "src/utils/file";
import { DialogAnimate } from "../animate";
import { useEffect, useState } from "react";
import Topic from "@material-ui/icons/Topic";
import Print from "@material-ui/icons/Print";
import InputCellphone from "../InputCellphone";
import { LoadingButton } from "@material-ui/lab";
import { useAuthUser } from "next-firebase-auth";
import FormAddress from "./components/form-address";
import { Form, FormikProvider, useFormik } from "formik";
import AssociateAutocomplete from "../AssociateAutocomplete";
import { getDateLocalized } from "src/utils/localizedDateFns";
import DialogShootingTest from "../command/shooting-test/dialog-add-consumption-associated";
import {
  NATIONALITY,
  GENDER_TYPE,
  SCHOOLING_TYPE,
  MARITAL_STATUS,
  CATEGORY_OPTIONS,
  INTERNAL_USER_TYPE,
} from "src/utils/enums";
import {
  Box,
  Grid,
  Card,
  Chip,
  Menu,
  Stack,
  Select,
  Switch,
  Button,
  MenuItem,
  Checkbox,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  OutlinedInput,
  FormControlLabel,
} from "@material-ui/core";
import { capitalize } from "src/utils/string";
import { RestrictedButton } from "../RestrictedButton";
import { USER_TYPE } from "src/utils/auth";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function UserDataForm({ currentUser }) {
  const AuthUser = useAuthUser();
  const userInfo = useSelector((state) => state.user.userInfo);
  const router = useRouter();
  const { id, isNew, creation } = router.query;
  const isEdit = !isNew;
  const [anchorEl, setAnchorEl] = useState(null);
  const [spouse, setSpouse] = useState({});
  const [password, setPassword] = useState("");
  const [noEmail, setNoEmail] = useState(false);
  const [openPrint, setOpenPrint] = useState(false);
  const [resumeForm, setResumeform] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState({});
  const [openedDialog, setOpenedDialog] = useState(false);
  const [disabledSave, setDisabledSave] = useState(false);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isLoadingPrint, setIsLoadingPrint] = useState(false);
  const [currentAddress, setCurrentAddress] = useState({});
  const [nextPaymentDisabled, setNextPaymentDisabled] = useState(userInfo.accessLevel < 99);
  const [showAssociateEmission, setShowAssociateEmission] = useState(false);
  const [isOpenPasswordRequired, setIsOpenPasswordRequired] = useState(false);

  useEffect(() => {

    const handlerProfilePhoto = (e) => {
      const file = e.detail.file;
      setProfilePhoto(file);
    };

    document.addEventListener(
      "CurrentUser.updateProfilePhoto",
      handlerProfilePhoto
    );

    return () => {
      document.removeEventListener(
        "CurrentUser.updateProfilePhoto",
        handlerProfilePhoto
      );
    };
  }, []);

  useEffect(() => {
    if (isEdit) {
      setResumeform(false);
    }
    const shouldShowAssociate = Boolean(creation);

    if (shouldShowAssociate) {
      setShowAssociateEmission(true);
    }
  }, []);

  const UserDataSchema = Yup.object().shape({
    active: Yup.boolean(),
    affiliationNumber: Yup.number(),
    name: Yup.string().required("Nome é obrigatório"),
    email: Yup.string().email("Digite um e-mail válido"),
    phoneNumber: Yup.string().required("Número é obrigatório"),
    company: Yup.string(),
    birthDate: Yup.string().required("Data de Nascimento é obrigatório"),
    occupation: Yup.string(),
    fathersName: Yup.string(),
    mothersName: Yup.string(),
    spouse: Yup.string(),
    spouseName: Yup.string(),
    affiliationDate: Yup.string().when("internalUserType", {
      is: (value) => value === "1",
      then: Yup.string().required("Data de Afiliação obrigatória"),
      otherwise: Yup.string(),
    }),
    nextPayment: Yup.string(),
    crNumber: Yup.string(),
    validityCR: Yup.string().nullable(),
    ibamaCTF: Yup.string(),
    validityCTF: Yup.string().nullable(),
    psychologicalExamExpiration: Yup.string(),
    schooling: Yup.string(),
    maritalStatus: Yup.string(),
    gender: Yup.string().required("Gênero obrigatório"),
    nationality: Yup.string().required("Nacionalidade obrigatória"),
    city: Yup.string(),
    uf: Yup.string().required("UF obrigatório"),
    rgNumber: Yup.string()
      .max(10, "Permitido apenas 10 números")
      .required("Número RG obrigatório"),
    issuingAgency: Yup.string(),
    issueDate: Yup.string(),
    cpf: Yup.string().required("CPF obrigatório"),
    voterTitle: Yup.string(),
    federationAssociated: Yup.string(),
    confederationAssociated: Yup.string(),
    category: Yup.array(),
    active: Yup.boolean(),
    observations: Yup.string(),
    internalUserType: Yup.string().required(
      "Tipo de Cliente deve ser selecionado"
    ),
  });

  const today = getDateLocalized(new Date(), "MM-dd-yyyy");

  const formik = useFormik({
    initialValues: {
      affiliationNumber: currentUser?.affiliationNumber || "",
      active: currentUser?.active || true,
      name: currentUser?.name || "",
      birthDate: currentUser?.birthDate || "",
      email: currentUser?.email || "",
      phoneNumber: currentUser?.phoneNumber || "",
      company: currentUser?.company || "",
      occupation: currentUser?.occupation || "",
      fathersName: currentUser?.fathersName || "",
      mothersName: currentUser?.mothersName || "",
      spouse: currentUser?.spouse || "",
      spouseName: currentUser?.spouseName || "",
      affiliationDate: currentUser?.affiliationDate || today,
      nextPayment: currentUser?.nextPayment || "",
      crNumber: currentUser?.crNumber || "",
      validityCR: currentUser?.validityCR || "",
      ibamaCTF: currentUser?.ibamaCTF || "",
      validityCTF: currentUser?.validityCTF || "",
      psychologicalExamExpiration:
        currentUser?.psychologicalExamExpiration || "",
      schooling: currentUser?.schooling || "",
      maritalStatus: currentUser?.maritalStatus || "",
      gender: currentUser?.gender || "",
      nationality: currentUser?.nationality || "",
      city: currentUser?.city || "",
      uf: currentUser?.uf || "",
      rgNumber: currentUser?.rgNumber || "",
      issuingAgency: currentUser?.issuingAgency || "",
      issueDate: currentUser?.issueDate || "",
      cpf: currentUser?.cpf || "",
      voterTitle: currentUser?.voterTitle || "",
      federationAssociated: currentUser?.federationAssociated || "",
      confederationAssociated: currentUser?.confederationAssociated || "",
      category: currentUser?.category || [],
      active: currentUser?.active || "",
      observations: currentUser?.observations || "",
      internalUserType: currentUser?.internalUserType || "",
    },
    validationSchema: UserDataSchema,
    onSubmit: async (values) => {
      try {
        let downloadUrl = null;
        const fileStorageId = `associate-photos/${id}`;
        if (profilePhoto && profilePhoto.path) {
          const fileStorageId = `associate-photos/${id}`;
          const storageRef = firebase.storage().ref();
          const documentsRef = storageRef.child(fileStorageId);

          const fileStorage = await documentsRef.put(profilePhoto, {
            contentType: profilePhoto.type,
          });

          downloadUrl = await fileStorage.ref.getDownloadURL();
        }

        if (isEdit) {
          return handleUpdateDataUser({
            ...values,
            profilePhoto: downloadUrl,
            profilePhotoStorageId: fileStorageId,
          });
        }

        const token = await AuthUser.getIdToken();
        const response = await fetch("/api/associate/data", {
          method: "POST",
          body: JSON.stringify({
            ...values,
            name: capitalize(values.name),
            profilePhoto: downloadUrl,
            profilePhotoStorageId: fileStorageId,
            createdBy: userInfo.id,
          }),
          headers: {
            Authorization: token,
          },
        });

        const data = await response.json();

        if (data && data.success) {
          Toast.success("Associado cadastrado com sucesso!");
          if (!isEdit) setIsOpenDialog(true);

          if (verifyUserToNextPayment) {
            setNextPaymentDisabled(true)
          }

          if (isOpenDialog === false) {
            if (process.browser) {
              window.location.href = `/associates/register/${data.createdUserId}?creation=true/addresses`;
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
    },
  });

  const handleUpdateDataUser = async (values) => {
    try {
      const newValuesFormatted = {};

      if (values.birthDate) {
        newValuesFormatted.birthDate = getDateLocalized(
          new Date(values.birthDate),
          "MM-dd-yyyy"
        );
      }

      if (values.affiliationDate) {
        newValuesFormatted.affiliationDate = getDateLocalized(
          new Date(values.affiliationDate),
          "MM-dd-yyyy"
        );
      }

      if (values.issueDate) {
        newValuesFormatted.issueDate = getDateLocalized(
          new Date(values.issueDate),
          "MM-dd-yyyy"
        );
      }

      if (values.nextPayment) {
        newValuesFormatted.nextPayment = getDateLocalized(
          new Date(values.nextPayment),
          "MM-dd-yyyy"
        );
      }

      if (values.validityCR) {
        newValuesFormatted.validityCR = getDateLocalized(
          new Date(values.validityCR),
          "MM-dd-yyyy"
        );
      }

      if (values.validityCTF) {
        newValuesFormatted.validityCTF = getDateLocalized(
          new Date(values.validityCTF),
          "MM-dd-yyyy"
        );
      }

      const token = await AuthUser.getIdToken();
      const newValues = Object.assign(values, newValuesFormatted);
      const response = await fetch("/api/associate/data", {
        method: "PUT",
        body: JSON.stringify({
          ...newValues,
          modifiedBy: userInfo.id,
          id,
          name: capitalize(values.name),
        }),
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();

      if (data && data.success) {
        Toast.success("Dados do associado alterados com sucesso!");

        if (verifyUserToNextPayment) {
          setNextPaymentDisabled(true)
        }

        const event = new CustomEvent("CurrentUser.reload");
        document.dispatchEvent(event);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const {
    errors,
    touched,
    handleSubmit,
    isSubmitting,
    getFieldProps,
    values,
  } = formik;

  const getCategoryByValue = (value) => {
    return CATEGORY_OPTIONS.find((item) => item.value === value);
  };

  const handleFieldChange = (field, event) => {
    const value = event.target.value;
    formik.setFieldValue(field, value);
  };

  const handleClosePrint = () => {
    setAnchorEl(null);
    setOpenPrint(false);
  };

  const handleChangeCpf = async (event) => {
    const value = event.target.value;
    if (!value) {
      return;
    }

    formik.setFieldValue("cpf", value);
    if (value && value.length < 11) {
      return;
    }

    let url = "/api/associate/data";
    const queryParams = new URLSearchParams();
    queryParams.append("limit", 1);
    queryParams.append("page", 1);

    if (value) {
      queryParams.append("cpf", value);
    }

    const searchQuery = queryParams.toString();

    if (searchQuery) {
      url = `${url}?${searchQuery}`;
    }

    const token = await AuthUser.getIdToken();
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    const data = await response.json();

    if (data && data.pagination && data.pagination.totalCount) {
      const message = "Já existe um Associado com esse CPF";
      Toast.error(message);
      return setDisabledSave(true);
    }

    setDisabledSave(false);
  };

  const handleChangeActive = () => {
    const value = !values.active;
    formik.setFieldValue("active", value);
  };

  const handleOpenPrint = (event) => {
    setAnchorEl(event.currentTarget);
    setOpenPrint(true);
  };

  const handleHelloPrint = async () => {
    try {
      setIsLoadingPrint(true);
      await printFile(`/api/associate/affiliation/hello/${currentUser.id}`, {});
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoadingPrint(false);
    }
  };
  const printAffiliation = async () => {
    try {
      setIsLoadingPrint(true);
      handleClosePrint();
      await printFile(`/api/associate/affiliation/${currentUser.id}`, {});
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoadingPrint(false);
    }
  };

  async function printDeclaration(type, data = {}, method = "GET") {
    try {
      setIsLoadingPrint(true);
      handleClosePrint();
      await printFile(
        `/api/associate/declaration/${type}/${currentUser.id}`,
        data,
        "pdf",
        null,
        method
      );
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoadingPrint(false);
    }
  }

  async function addDataBeforePrint() {
    setOpenedDialog(true);
    handleClosePrint();
  }

  const handleCloseDialog = (weaponsData) => {
    setOpenedDialog(false);
    printDeclaration(
      "shooting-test-eb",
      {
        weaponsData,
      },
      "POST"
    );
  };

  const verifyUser =
    getFieldProps("internalUserType").value === 1 ||
    getFieldProps("internalUserType").value === 6 ||
    getFieldProps("internalUserType").value === 7 ||
    getFieldProps("internalUserType").value === 8 ||
    getFieldProps("internalUserType").value === 9;

  const verifyUserToNextPayment =
    getFieldProps("internalUserType").value === 2 ||
    getFieldProps("internalUserType").value === 3 ||
    getFieldProps("internalUserType").value === 4 ||
    getFieldProps("internalUserType").value === 5;

  const startCompletForm = () => {
    setResumeform(false);
    setNoEmail(false);
  };

  const startResumeForm = () => {
    setResumeform(true);
  };

  const toChengeSetEmail = () => {
    setNoEmail(!noEmail);
  };

  const onSelectSpouse = (spouse) => {
    setSpouse(spouse);

    formik.setFieldValue("spouseName", spouse.name);
  };

  const onChangeField = (fieldName) => (event) => {
    const value = event.target.value;
    formik.setFieldValue(fieldName, value);
  };

  const goToSpousePage = (spouse) => {
    window.location.href = `/associates/register/${spouse}`;
  };



  const activeChangeNextPayment = () => {
    setNextPaymentDisabled(false)
  }

  const verifyUserActions = [];

  if (verifyUser) {
    verifyUserActions.push({
      label: "Declaração Filiação",
      style: { minWidth: 215 },
      name: "affiliation"
    });

    verifyUserActions.push({
      label: "Declaração Habitualidade",
      style: {},
      name: "habituality"
    });

    verifyUserActions.push({
      label: "Declaração Modalidade",
      style: {},
      name: "modality"
    });
  }

  return (
    <>
      <FormikProvider value={formik}>
        <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Card sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", justifyContent: "flex-start" }}
                style={{ position: "relative" }}
              >
                <Typography variant="h5">Dados Pessoais</Typography>

                <div>
                  <LoadingButton
                    type="button"
                    size="medium"
                    variant={resumeForm ? "contained" : "outlined"}
                    startIcon={<Topic />}
                    style={{
                      marginLeft: 15,
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                    }}
                    id="print-button"
                    aria-haspopup="true"
                    onClick={startResumeForm}
                    loading={isLoadingPrint}
                  >
                    Resumido
                  </LoadingButton>
                  <LoadingButton
                    type="button"
                    size="medium"
                    variant={!resumeForm ? "contained" : "outlined"}
                    style={{
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                    }}
                    startIcon={<Topic />}
                    id="print-button"
                    aria-haspopup="true"
                    onClick={startCompletForm}
                    loading={isLoadingPrint}
                  >
                    Completo
                  </LoadingButton>
                </div>

                {!isNew && (
                  <div style={{ position: "absolute", right: 0 }}>
                    <LoadingButton
                      type="button"
                      size="medium"
                      variant="outlined"
                      startIcon={<Print />}
                      style={{ marginRight: 12 }}
                      id="print-button"
                      aria-haspopup="true"
                      onClick={handleHelloPrint}
                      loading={isLoadingPrint}
                    >
                      Boas Vindas
                    </LoadingButton>
                    <LoadingButton
                      type="button"
                      size="medium"
                      variant="outlined"
                      startIcon={<Print />}
                      style={{ marginRight: 12 }}
                      id="print-button"
                      aria-controls={openPrint ? "print-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={openPrint ? "true" : undefined}
                      onClick={handleOpenPrint}
                      loading={isLoadingPrint}
                    >
                      Imprimir
                    </LoadingButton>
                    <Menu
                      id="print-menu"
                      anchorEl={anchorEl}
                      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                      open={openPrint}
                      onClose={handleClosePrint}
                      MenuListProps={{
                        "aria-labelledby": "print-button",
                      }}
                      style={{ marginTop: 4, marginLeft: -100 }}
                    >
                      {verifyUserActions.map((item) => (
                        <MenuItem
                          style={item.style}
                          onClick={() => printDeclaration(item.name)}
                          key={item.name}
                        >
                          <Print />
                          <span
                            style={{
                              display: "inline-block",
                              marginLeft: 12,
                            }}
                          >
                            {item.label}
                          </span>
                        </MenuItem>
                      ))}

                      <MenuItem
                        onClick={() => printDeclaration("customer-address")}
                      >
                        <Print />
                        <span
                          style={{
                            display: "inline-block",
                            marginLeft: 12,
                          }}
                        >
                          Declaração de Endereço de Guarda de Acervo
                        </span>
                      </MenuItem>

                      <MenuItem
                        onClick={() =>
                          printDeclaration("non-existence-inquiries")
                        }
                      >
                        <Print />
                        <span
                          style={{
                            display: "inline-block",
                            marginLeft: 12,
                          }}
                        >
                          Declaração de Inexistência de Inquéritos Policiais ou
                          Processos Criminais
                        </span>
                      </MenuItem>

                      <MenuItem onClick={() => addDataBeforePrint()}>
                        <Print />
                        <span
                          style={{ display: "inline-block", marginLeft: 12 }}
                        >
                          Teste de Tiro EB
                        </span>
                      </MenuItem>
                      <MenuItem
                        onClick={() => printDeclaration("shooting-test-pf")}
                      >
                        <Print />
                        <span
                          style={{ display: "inline-block", marginLeft: 12 }}
                        >
                          Teste de Tiro PF
                        </span>
                      </MenuItem>
                      <MenuItem onClick={printAffiliation}>
                        <Print />
                        <span
                          style={{ display: "inline-block", marginLeft: 12 }}
                        >
                          Ficha Cadastral
                        </span>
                      </MenuItem>
                    </Menu>
                  </div>
                )}
              </Box>
              {resumeForm ? (
                <>
                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                      width:
                        getFieldProps("internalUserType").value === 6
                          ? "100%"
                          : 550,
                    }}
                    spacing={{ xs: 3, sm: 2 }}
                    mt={3}
                  >
                    {isEdit && (
                      <TextField
                        label="Nº Filiação"
                        value={formik.values.affiliationNumber}
                        disabled={true}
                        error={Boolean(
                          touched.affiliationNumber && errors.affiliationNumber
                        )}
                        helperText={
                          touched.affiliationNumber && errors.affiliationNumber
                        }
                        sx={{ width: 250 }}
                      />
                    )}

                    <InputCpf
                      label="CPF"
                      value={formik.values.cpf}
                      onChange={(event) => handleChangeCpf(event)}
                      disabled={isEdit && userInfo.accessLevel <= 2}
                      error={Boolean(touched.cpf && errors.cpf)}
                      helperText={touched.cpf && errors.cpf}
                    />

                    <TextField
                      select
                      fullWidth
                      margin="none"
                      label="Tipo de Cliente"
                      {...getFieldProps("internalUserType")}
                      error={Boolean(
                        touched.internalUserType && errors.internalUserType
                      )}
                      helperText={
                        touched.internalUserType && errors.internalUserType
                      }
                    >
                      {INTERNAL_USER_TYPE.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.title}
                        </MenuItem>
                      ))}
                    </TextField>
                    {getFieldProps("internalUserType").value === 6 && (
                      <Grid item sm={14} xs={12}>
                        {formik.values.spouse && formik.values.spouseName ? (
                          <TextField
                            fullWidth
                            label="Cônjuge"
                            disabled={true}
                            value={formik.values.spouseName}
                            onClick={() => goToSpousePage(formik.values.spouse)}
                          />
                        ) : (
                          <AssociateAutocomplete
                            fullWidth
                            label="Cônjuge"
                            onSelect={onSelectSpouse}
                            {...getFieldProps("spouse")}
                            onChange={onChangeField("spouse")}
                          />
                        )}
                      </Grid>
                    )}

                    {isEdit && (
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
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 3, sm: 2 }}
                    mt={3}
                  >
                    <TextField
                      fullWidth
                      label="Nome Completo"
                      style={{ width: "45%" }}
                      {...getFieldProps("name")}
                      error={Boolean(touched.name && errors.name)}
                      helperText={touched.name && errors.name}
                    />
                    {!noEmail && (
                      <TextField
                        fullWidth
                        label="Email"
                        {...getFieldProps("email")}
                        style={{ width: "40%" }}
                        helperText={touched.email && errors.email}
                      />
                    )}
                    <div
                      style={{ justifyContent: "center", alignItems: "center" }}
                    >
                      <Button onClick={toChengeSetEmail}>
                        {!noEmail ? `Não possui E-mail` : `Possui E-mail`}
                      </Button>
                    </div>
                  </Stack>
                  <Stack
                    mt={3}
                    mb={3}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 3, sm: 2 }}
                  >
                    <InputCellphone
                      label="Celular"
                      value={formik.values.phoneNumber}
                      onChange={(event) =>
                        handleFieldChange("phoneNumber", event)
                      }
                      onCopy={(e) => {
                        const selection = document.getSelection();
                        e.clipboardData.setData(
                          "text/plain",
                          selection.toString().replace(/[^0-9]/g, "")
                        );
                        e.preventDefault();
                      }}
                      error={Boolean(touched.phoneNumber && errors.phoneNumber)}
                      helperText={touched.phoneNumber && errors.phoneNumber}
                    />
                    <InputDate
                      label="Data de Nascimento"
                      value={formik.values.birthDate}
                      onChange={(event) =>
                        handleFieldChange("birthDate", event)
                      }
                      error={Boolean(touched.birthDate && errors.birthDate)}
                      helperText={touched.birthDate && errors.birthDate}
                    />
                    <TextField
                      select
                      fullWidth
                      margin="none"
                      label="Gênero"
                      {...getFieldProps("gender")}
                      helperText={touched.gender && errors.gender}
                      error={Boolean(touched.gender && errors.gender)}
                    >
                      {GENDER_TYPE.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.title}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </>
              ) : (
                <>
                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                      width:
                        getFieldProps("internalUserType").value === 6
                          ? "100%"
                          : 550,
                    }}
                    spacing={{ xs: 3, sm: 2 }}
                    mt={3}
                  >
                    {isEdit && (
                      <TextField
                        label="Nº Filiação"
                        value={formik.values.affiliationNumber}
                        disabled={true}
                        error={Boolean(
                          touched.affiliationNumber && errors.affiliationNumber
                        )}
                        helperText={
                          touched.affiliationNumber && errors.affiliationNumber
                        }
                        sx={{ width: 250 }}
                      />
                    )}

                    <InputCpf
                      label="CPF"
                      value={formik.values.cpf}
                      onChange={(event) => handleChangeCpf(event)}
                      disabled={isEdit && userInfo.accessLevel <= 2}
                      error={Boolean(touched.cpf && errors.cpf)}
                      helperText={touched.cpf && errors.cpf}
                    />

                    <TextField
                      select
                      fullWidth
                      margin="none"
                      label="Tipo de Cliente"
                      {...getFieldProps("internalUserType")}
                      error={Boolean(
                        touched.internalUserType && errors.internalUserType
                      )}
                      helperText={
                        touched.internalUserType && errors.internalUserType
                      }
                    >
                      {INTERNAL_USER_TYPE.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.title}
                        </MenuItem>
                      ))}
                    </TextField>
                    {getFieldProps("internalUserType").value === 6 && (
                      <Grid item sm={14} xs={12}>
                        {formik.values.spouse && formik.values.spouseName ? (
                          <TextField
                            fullWidth
                            label="Cônjuge"
                            disabled={true}
                            value={formik.values.spouseName}
                            onClick={() => goToSpousePage(formik.values.spouse)}
                          />
                        ) : (
                          <AssociateAutocomplete
                            fullWidth
                            label="Cônjuge"
                            onSelect={onSelectSpouse}
                            {...getFieldProps("spouse")}
                            onChange={onChangeField("spouse")}
                          />
                        )}
                      </Grid>
                    )}
                    {isEdit && (
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
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 3, sm: 2 }}
                    mt={3}
                  >
                    <TextField
                      fullWidth
                      label="Nome Completo"
                      {...getFieldProps("name")}
                      error={Boolean(touched.name && errors.name)}
                      helperText={touched.name && errors.name}
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      {...getFieldProps("email")}
                      error={Boolean(touched.email && errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  </Stack>

                  <Stack
                    mt={3}
                    mb={3}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 3, sm: 2 }}
                  >
                    <InputCellphone
                      label="Celular"
                      value={formik.values.phoneNumber}
                      onChange={(event) =>
                        handleFieldChange("phoneNumber", event)
                      }
                      onCopy={(e) => {
                        const selection = document.getSelection();
                        e.clipboardData.setData(
                          "text/plain",
                          selection.toString().replace(/[^0-9]/g, "")
                        );
                        e.preventDefault();
                      }}
                      error={Boolean(touched.phoneNumber && errors.phoneNumber)}
                      helperText={touched.phoneNumber && errors.phoneNumber}
                    />

                    <InputDate
                      label="Data de Nascimento"
                      value={formik.values.birthDate}
                      onChange={(event) =>
                        handleFieldChange("birthDate", event)
                      }
                      error={Boolean(touched.birthDate && errors.birthDate)}
                      helperText={touched.birthDate && errors.birthDate}
                    />
                  </Stack>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 3, sm: 2 }}
                  >
                    <TextField
                      select
                      fullWidth
                      margin="none"
                      label="Escolaridade"
                      {...getFieldProps("schooling")}
                      error={Boolean(touched.schooling && errors.schooling)}
                      helperText={touched.schooling && errors.schooling}
                    >
                      {SCHOOLING_TYPE.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.title}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      fullWidth
                      label="Estado Civil"
                      {...getFieldProps("maritalStatus")}
                      error={Boolean(
                        touched.maritalStatus && errors.maritalStatus
                      )}
                      helperText={touched.maritalStatus && errors.maritalStatus}
                      margin="none"
                    >
                      {MARITAL_STATUS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.title}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      fullWidth
                      margin="none"
                      label="Gênero"
                      {...getFieldProps("gender")}
                      helperText={touched.gender && errors.gender}
                      error={Boolean(touched.gender && errors.gender)}
                    >
                      {GENDER_TYPE.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.title}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </>
              )}
            </Card>
            {resumeForm ? (
              <>
                <Card sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                    <Typography variant="h5">Documentos</Typography>
                  </Box>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 3, sm: 2 }}
                    mt={3}
                    mb={3}
                  >
                    <TextField
                      fullWidth
                      label="Número RG"
                      inputProps={{ maxLength: 10 }}
                      {...getFieldProps("rgNumber")}
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/, "");
                      }}
                      error={Boolean(touched.rgNumber && errors.rgNumber)}
                      helperText={touched.rgNumber && errors.rgNumber}
                    />
                    <TextField
                      fullWidth
                      label="Órgão Expedidor"
                      {...getFieldProps("issuingAgency")}
                    />

                    <TextField
                      fullWidth
                      label="UF"
                      {...getFieldProps("uf")}
                      error={Boolean(touched.uf && errors.uf)}
                      helperText={touched.uf && errors.uf}
                    />
                    <TextField
                      select
                      fullWidth
                      label="Nacionalidade"
                      {...getFieldProps("nationality")}
                      error={Boolean(touched.nationality && errors.nationality)}
                      helperText={touched.nationality && errors.nationality}
                      margin="none"
                    >
                      {NATIONALITY.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.title}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </Card>
                <Card sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                    <Typography variant="h5">Dados Clube</Typography>
                  </Box>

                  <Stack
                    direction={{ xs: "column", sm: "row", width: 300 }}
                    spacing={{ xs: 3, sm: 2 }}
                    mt={3}
                  >
                    <InputDate
                      label="Data de Cadastro"
                      value={formik.values.affiliationDate}
                      onChange={(date) =>
                        handleFieldChange("affiliationDate", date)
                      }
                      error={Boolean(
                        touched.affiliationDate && errors.affiliationDate
                      )}
                      helperText={
                        touched.affiliationDate && errors.affiliationDate
                      }
                    />
                  </Stack>
                </Card>
              </>
            ) : (
              <>
                <Card sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                    <Typography variant="h5">Documentos</Typography>
                  </Box>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 3, sm: 2 }}
                    mt={3}
                    mb={3}
                  >
                    <TextField
                      fullWidth
                      label="Número RG"
                      inputProps={{ maxLength: 10 }}
                      {...getFieldProps("rgNumber")}
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/, "");
                      }}
                      error={Boolean(touched.rgNumber && errors.rgNumber)}
                      helperText={touched.rgNumber && errors.rgNumber}
                    />
                    <TextField
                      fullWidth
                      label="Órgão Expedidor"
                      {...getFieldProps("issuingAgency")}
                    /*={Boolean(touched.issuingAgency && errors.issuingAgency)}
              helperText={touched.issuingAgency && errors.issuingAgency} */
                    />
                    <InputDate
                      label="Data Expedição"
                      value={formik.values.issueDate}
                      onChange={(date) => handleFieldChange("issueDate", date)}
                    /* error={Boolean(touched.issueDate && errors.issueDate)}
              helperText={touched.issueDate && errors.issueDate}*/
                    />

                    <TextField
                      fullWidth
                      label="UF"
                      {...getFieldProps("uf")}
                      error={Boolean(touched.uf && errors.uf)}
                      helperText={touched.uf && errors.uf}
                    />
                  </Stack>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 3, sm: 2 }}
                  >
                    <TextField
                      select
                      fullWidth
                      label="Nacionalidade"
                      {...getFieldProps("nationality")}
                      error={Boolean(touched.nationality && errors.nationality)}
                      helperText={touched.nationality && errors.nationality}
                      margin="none"
                    >
                      {NATIONALITY.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.title}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      fullWidth
                      label="Naturalidade"
                      {...getFieldProps("city")}
                      error={Boolean(touched.city && errors.city)}
                      helperText={touched.city && errors.city}
                    />
                    <TextField
                      fullWidth
                      label="Título Eleitor"
                      {...getFieldProps("voterTitle")}
                      error={Boolean(touched.voterTitle && errors.voterTitle)}
                      helperText={touched.voterTitle && errors.voterTitle}
                    />
                  </Stack>
                </Card>

                <Card sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                    <Typography variant="h5">Dados Adicionais</Typography>
                  </Box>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 3, sm: 2 }}
                    mt={3}
                    mb={3}
                  >
                    <TextField
                      fullWidth
                      label="Empresa"
                      {...getFieldProps("company")}
                      error={Boolean(touched.company && errors.company)}
                      helperText={touched.company && errors.company}
                    />
                    <TextField
                      fullWidth
                      label="Profissão"
                      {...getFieldProps("occupation")}
                      error={Boolean(touched.occupation && errors.occupation)}
                      helperText={touched.occupation && errors.occupation}
                    />
                  </Stack>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 3, sm: 2 }}
                  >
                    <TextField
                      fullWidth
                      label="Nome do Pai"
                      {...getFieldProps("fathersName")}
                      error={Boolean(touched.fathersName && errors.fathersName)}
                      helperText={touched.fathersName && errors.fathersName}
                    />
                    <TextField
                      fullWidth
                      label="Nome da Mãe"
                      {...getFieldProps("mothersName")}
                      error={Boolean(touched.mothersName && errors.mothersName)}
                      helperText={touched.mothersName && errors.mothersName}
                    />
                  </Stack>
                </Card>

                <Card sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                    <Typography variant="h5">Dados Governamentais</Typography>
                  </Box>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 3, sm: 2 }}
                    mt={3}
                  >
                    <InputDate
                      label="Data de Cadastro"
                      value={formik.values.affiliationDate}
                      onChange={(date) =>
                        handleFieldChange("affiliationDate", date)
                      }
                      error={Boolean(
                        touched.affiliationDate && errors.affiliationDate
                      )}
                      helperText={
                        touched.affiliationDate && errors.affiliationDate
                      }
                    />
                    {!verifyUserToNextPayment && (
                      <>
                        <InputDate
                          style={{ width: '50%' }}
                          label="Vencimento Anuidade"
                          disabled={nextPaymentDisabled}
                          value={formik.values.nextPayment}
                          onChange={(date) =>
                            handleFieldChange("nextPayment", date)
                          }
                          error={Boolean(
                            touched.nextPayment && errors.nextPayment
                          )}
                          helperText={touched.nextPayment && errors.nextPayment}
                        />

                        {nextPaymentDisabled &&
                          <RestrictedButton
                            requiredAccessLevel={USER_TYPE.SUPER}
                            style={{ textAlign: 'center', minWidth: 125 }}
                            onClick={activeChangeNextPayment}
                            variant="outlined"
                          >
                            Alterar Data
                          </RestrictedButton>
                        }
                      </>
                    )}
                    <TextField
                      fullWidth
                      label="Número CR"
                      style={{ width: '50%' }}
                      {...getFieldProps("crNumber")}
                      error={Boolean(touched.crNumber && errors.crNumber)}
                      helperText={touched.crNumber && errors.crNumber}
                    />
                    <InputDate
                      label="Validade CR"
                      style={{ width: '60%' }}
                      value={formik.values.validityCR}
                      onChange={(date) => handleFieldChange("validityCR", date)}
                      error={Boolean(touched.validityCR && errors.validityCR)}
                      helperText={touched.validityCR && errors.validityCR}
                    />
                  </Stack>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 3, sm: 2 }}
                    mt={3}
                    mb={3}
                  >
                    <TextField
                      fullWidth
                      label="CTF Ibama"
                      {...getFieldProps("ibamaCTF")}
                      error={Boolean(touched.ibamaCTF && errors.ibamaCTF)}
                      helperText={touched.ibamaCTF && errors.ibamaCTF}
                    />
                    <InputDate
                      label="Validade CTF"
                      value={formik.values.validityCTF}
                      onChange={(date) =>
                        handleFieldChange("validityCTF", date)
                      }
                      error={Boolean(touched.validityCTF && errors.validityCTF)}
                      helperText={touched.validityCTF && errors.validityCTF}
                    />
                    <InputDate
                      label="Vencimento Psicológico"
                      {...getFieldProps("psychologicalExamExpiration")}
                      value={formik.values.psychologicalExamExpiration}
                      onChange={(date) =>
                        handleFieldChange("psychologicalExamExpiration", date)
                      }
                      error={Boolean(
                        touched.psychologicalExamExpiration &&
                        errors.psychologicalExamExpiration
                      )}
                      helperText={
                        touched.psychologicalExamExpiration &&
                        errors.psychologicalExamExpiration
                      }
                    />
                  </Stack>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 3, sm: 2 }}
                  >
                    <TextField
                      fullWidth
                      label="Associado a Federação"
                      {...getFieldProps("federationAssociated")}
                      error={Boolean(
                        touched.federationAssociated &&
                        errors.federationAssociated
                      )}
                      helperText={
                        touched.federationAssociated &&
                        errors.federationAssociated
                      }
                    />
                    <TextField
                      fullWidth
                      label="Associado a Confederação"
                      {...getFieldProps("confederationAssociated")}
                      error={Boolean(
                        touched.confederationAssociated &&
                        errors.confederationAssociated
                      )}
                      helperText={
                        touched.confederationAssociated &&
                        errors.confederationAssociated
                      }
                    />
                  </Stack>
                </Card>

                <Card sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                    <Typography variant="h5">
                      Observações do associado
                    </Typography>
                  </Box>
                  <Stack
                    direction={{ xs: "column", sm: "column" }}
                    spacing={{ xs: 3, sm: 2 }}
                    mt={3}
                    mb={3}
                  >
                    <FormControl fullWidth>
                      <InputLabel id="category-label">Categoria</InputLabel>
                      <Select
                        fullWidth
                        labelId="category-label"
                        multiple
                        {...getFieldProps("category")}
                        error={Boolean(touched.category && errors.category)}
                        helperText={touched.category && errors.category}
                        input={<OutlinedInput label="Categoria" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                            {selected.map((value) => (
                              <Chip
                                key={value}
                                label={getCategoryByValue(value).title}
                                sx={{ m: "2px" }}
                              />
                            ))}
                          </Box>
                        )}
                        MenuProps={MenuProps}
                      >
                        {CATEGORY_OPTIONS.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            <Checkbox
                              checked={formik.values.category.includes(
                                item.value
                              )}
                            />
                            {item.title}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      multiline
                      label="Observações"
                      rows={4}
                      {...getFieldProps("observations")}
                    />
                  </Stack>
                </Card>
              </>
            )}
            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <LoadingButton
                type="button"
                variant="outlined"
                href="/associates/register"
                style={{ marginRight: 14 }}
              >
                Cancelar
              </LoadingButton>

              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                disabled={disabledSave}
              >
                Salvar
              </LoadingButton>
            </Box>
          </Stack>
        </Form>
      </FormikProvider>

      <DialogAnimate
        open={isOpenDialog}
        onClose={() => setIsOpenDialog(false)}
        widthMax={800}
      >
        <FormAddress
          handleClose={() => setIsOpenDialog(false)}
          userId={currentUser.id}
          currentAddress={currentAddress}
        />
      </DialogAnimate>

      <DialogAnimate
        widthMax={900}
        open={openedDialog}
        onClose={() => setOpenedDialog(false)}
      >
        <DialogShootingTest
          handleClose={handleCloseDialog}
          onCancel={() => setOpenedDialog(false)}
        />
      </DialogAnimate>
    </>
  );
}

UserDataForm.propTypes = {
  isEdit: PropTypes.bool,
  currentUser: PropTypes.object,
};
