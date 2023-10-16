import React, { useCallback, useState } from "react";
import * as Yup from "yup";
import PropTypes from "prop-types";
import Toast from "src/utils/toast";

import { LoadingButton } from "@material-ui/lab";
import InputDate from "src/components/InputDate";
import { Form, FormikProvider, useFormik } from "formik";
import { UploadSingleFile } from "src/components/upload";
import {
  Box,
  Card,
  Stack,
  MenuItem,
  TextField,
  Typography,
} from "@material-ui/core";
import { useAuthUser } from "next-firebase-auth";
import firebase from "firebase/app";
import { generateId } from "src/utils/auth";
import { DOCUMENTS, getEnumTitle } from "src/utils/enums";
import { useSelector } from "react-redux";
import * as dateFns from "src/utils/localizedDateFns";

const FormDocuments = ({ currentDocument, handleClose, userId }) => {
  const AuthUser = useAuthUser();
  const userInfo = useSelector((state) => state.user.userInfo);
  const [file, setFile] = useState(null);
  const [typeDocument, setTypeDocument] = useState(null);
  const [nameDocument, setNameDocument] = useState("");
  const isNew = !Boolean(currentDocument?.docId);

  const localClose = () => {
    setTypeDocument(null);
    setNameDocument("");
    handleClose();
    formik.resetForm();
  };

  const UserAddressSchema = Yup.object().shape({
    type: Yup.string().required("Documento é obrigatório"),
    expireDate: Yup.string().required("Data de vencimento é obrigatório"),
    observation: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      type: currentDocument?.type || "",
      expireDate: currentDocument?.expireDate || "",
      observation: currentDocument?.observation || "",
    },
    validationSchema: UserAddressSchema,
    onSubmit: async (values) => {
      try {
        if (isNew) {
          if (!file) {
            return Toast.error("Selecione o arquivo primeiro.");
          }

          let today = new Date();
          let dueDate = new Date(values.expireDate);
          if (
            dateFns.isSameDay(today, dueDate) ||
            dateFns.isBefore(dueDate, today)
          ) {
            return Toast.error("Data de validade do documento inválida!");
          }

          const fileStorageId = `associate-documents-${userId}-${generateId(
            8
          )}-${getEnumTitle(DOCUMENTS, values.type)}`;
          const storageRef = firebase.storage().ref();
          const documentsRef = storageRef.child(fileStorageId);

          const fileStorage = await documentsRef.put(file, {
            contentType: file.type,
          });

          const downloadUrl = await fileStorage.ref.getDownloadURL();

          const token = await AuthUser.getIdToken();
          const response = await fetch("/api/associate/documents", {
            method: "POST",
            body: JSON.stringify({
              ...values,
              document: downloadUrl,
              documentStorageId: fileStorageId,
              associateId: userId,
              createdBy: userInfo.id,
            }),
            headers: {
              Authorization: token,
            },
          });

          const data = await response.json();

          if (data && data.success) {
            Toast.success("Documento cadastrado com sucesso!");
            setTypeDocument(0);
            setNameDocument("");
            handleClose(true);
            formik.resetForm();
          }
        } else {
          let today = new Date();
          let dueDate = new Date(values.expireDate);
          if (
            dateFns.isSameDay(today, dueDate) ||
            dateFns.isBefore(dueDate, today)
          ) {
            return Toast.error("Data de validade do documento inválida!");
          }

          const token = await AuthUser.getIdToken();
          const response = await fetch("/api/associate/documents", {
            method: "PUT",
            body: JSON.stringify({
              docId: currentDocument.docId,
              expireDate: values.expireDate,
            }),
            headers: {
              Authorization: token,
            },
          });

          const data = await response.json();

          if (data && data.success) {
            Toast.success("Documento editado com sucesso!");
            setTypeDocument(0);
            setNameDocument("");
            handleClose(true);
            formik.resetForm();
          }
        }
      } catch (err) {
        console.log(err);
      }
    },
  });

  const {
    errors,
    touched,
    isSubmitting,
    handleSubmit,
    getFieldProps,
    values,
  } = formik;

  const handleFieldChange = (field, event) => {
    const value = event.target.value;
    formik.setFieldValue(field, value);
  };

  const handleDropSingleFile = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
    }
  }, []);

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Card sx={{ p: 3 }}>
          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-start" }}>
            {isNew ? (
              <Typography variant="h5" paragraph>
                Enviar Documento
              </Typography>
            ) : (
              <Typography variant="h5" paragraph>
                Editar Documento
              </Typography>
            )}
          </Box>

          <Stack spacing={3}>
            <Stack
              direction={{
                xs: "column",
                sm: "row",
                justifyContent: "space-between",
              }}
              spacing={{ xs: 3, sm: 2 }}
            >
              <TextField
                select
                fullWidth
                style={{ width: "50%" }}
                label="Tipo Documento"
                {...getFieldProps("type")}
                error={Boolean(touched.type && errors.type)}
                helperText={touched.type && errors.type}
              >
                {DOCUMENTS.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    onClick={() => {
                      setTypeDocument(option.value);
                      setNameDocument(option.title);
                    }}
                  >
                    {option.title}
                  </MenuItem>
                ))}
              </TextField>

              <InputDate
                fullWidth={false}
                style={{ width: "50%" }}
                value={formik.values.expireDate}
                label={`Data Vencimento ${nameDocument ? nameDocument : ""}`}
                onChange={(date) => handleFieldChange("expireDate", date)}
                error={Boolean(touched.expireDate && errors.expireDate)}
                helperText={touched.expireDate && errors.expireDate}
              />
            </Stack>
            <Stack spacing={{ xs: 3, sm: 2 }}>
              <TextField
                multiline
                rows={4}
                label="Descrição"
                {...getFieldProps("observation")}
                error={Boolean(touched.observation && errors.observation)}
                helperText={touched.observation && errors.observation}
              />
            </Stack>

            {isNew && (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 3, sm: 2 }}
              >
                <UploadSingleFile file={file} onDrop={handleDropSingleFile} />
              </Stack>
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
                onClick={localClose}
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

FormDocuments.propTypes = {
  currentUser: PropTypes.object,
  handleClose: PropTypes.func,
};

export default FormDocuments;
