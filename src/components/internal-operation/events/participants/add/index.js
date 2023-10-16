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
  Grid,
  TextField,
  Typography,
} from "@material-ui/core";
import AddList from "../add-list";
import { useSelector } from "react-redux";

const AddParticipant = ({ handleClose, currentEvent }) => {
  const [participantsList, setParticipantsList] = useState([]);
  const [isLoadingParticipantList, setIsLoadingParticipantList] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const AuthUser = useAuthUser();
  const userInfo = useSelector(state => state.user.userInfo);
  const UserAddressSchema = Yup.object().shape({
    search: Yup.string().min(3, "A termo de busca deve conter pelo menos 3 caracteres").required("O termo de busca deve ser preenchido"),
  });

  const formik = useFormik({
    initialValues: {
      search: ""
    },
    validationSchema: UserAddressSchema,
    onSubmit: async (values) => {
      try {
        setIsLoadingParticipantList(true);
        const token = await AuthUser.getIdToken();
        const response = await fetch(`/api/associate/data?search=${values.search}`, {
          method: "GET",
          headers: {
            Authorization: token,
          },
        });

        const data = await response.json();

        if (data && data.success) {
          setParticipantsList(data.hits);

          if (data.hits.length === 0) {
            setNoResults(true);
          } else {
            setNoResults(false);
          }
        }
      } catch (err) {
        Toast.error("Erro ao buscar associados");
        console.log(err);
      }

      setIsLoadingParticipantList(false);
    },
  });

  const { isSubmitting, getFieldProps, touched, errors } = formik;

  const onSelectParticipant = index => {
    const newLocalParticipants = [...participantsList];
    newLocalParticipants[index].selected = !newLocalParticipants[index].selected;

    setParticipantsList(newLocalParticipants);
  }

  const getSelecteds = () => {
    return participantsList.filter(item => item.selected);
  };

  const onSave = async () => {
    try {
      const participantsToAdd = getSelecteds();

      const token = await AuthUser.getIdToken();
      const response = await fetch(`/api/internal/events/participants`, {
        method: "POST",
        body: JSON.stringify({
          participants: participantsToAdd,
          createdBy: userInfo.id,
          eventId: currentEvent.docId
        }),
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();

      if (data && data.success) {
        handleClose(true);

        if (data.messages) {
          data.messages.map(item => item.type === "error" ? Toast.error(item.message) : Toast.success(item.message));
        }
      }
    } catch(e) {
      console.log(e);
      Toast.error("Erro ao adicionar participantes");
    }
  };

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off">
        <Card sx={{ p: 3 }}>
          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-start" }}>
            <Typography variant="h5" paragraph>
              Adicionar Participante
            </Typography>
          </Box>

          <Grid container spacing={2} sx={{ marginTop: 1 }}>
            <Grid item xs={12} sm={10}>
              <TextField
                fullWidth
                label="Nome, CPF, Número CR, Email ou Celular"
                {...getFieldProps("search")}
                error={Boolean(touched.search && errors.search)}
                helperText={touched.search && errors.search}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <LoadingButton
                fullWidth
                type="submit"
                onClick={() => {}}
                variant="contained"
                loading={isSubmitting}
                style={{height: 44}}
              >
                Buscar
              </LoadingButton>
            </Grid>
          </Grid>

          <AddList
            participants={participantsList}
            onSelect={onSelectParticipant}
            isLoading={isLoadingParticipantList}
            noResults={noResults}
          />

          <Grid container spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
            <Grid item>
              <LoadingButton
                type="button"
                variant="outlined"
                onClick={handleClose}
                loading={isSubmitting}
              >
                Fechar
              </LoadingButton>
            </Grid>
            {
              getSelecteds().length > 0 && (
                <Grid item>
                  <LoadingButton
                    type="button"
                    variant="contained"
                    loading={isSubmitting}
                    onClick={onSave}
                  >
                    Salvar
                  </LoadingButton>
                </Grid>
              )
            }
          </Grid>
        </Card>
      </Form>
    </FormikProvider>
  );
};

AddParticipant.propTypes = {
  handleClose: PropTypes.func,
};

export default AddParticipant;
