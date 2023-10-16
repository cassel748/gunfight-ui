import { useState } from "react";
import * as Yup from "yup";
import PropTypes from "prop-types";
import dynamic from "next/dynamic";
import Toast from "src/utils/toast";
import Page from "src/components/Page";
import { useRouter } from "next/router";
import { withAuthLevel } from "src/utils/auth";
import { getAbsoluteUrl } from "src/utils/auth";
import DashboardLayout from "src/layouts/dashboard";
import { Form, FormikProvider, useFormik } from "formik";
import InputDateTime from "src/components/InputDateTime";
import { experimentalStyled as styled } from "@material-ui/core/styles";
import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import { LoadingButton, TabList, TabContext, TabPanel } from "@material-ui/lab";
import Participants from "src/components/internal-operation/events/participants";
import {
  Box,
  Tab,
  Card,
  Grid,
  Stack,
  TextField,
  Container,
  Typography,
} from "@material-ui/core";
import { useSelector } from "react-redux";

const QuillEditor = dynamic(() => import("src/components/Editor/quill"), {
  ssr: false,
});

// ----------------------------------------------------------------------

const TabsWrapper = styled(TabList)(({ theme }) => ({
  borderBottom: `2px solid ${theme.palette.primary.main}`,
  marginTop: 18,
  padding: "0 34px",
}));

const TabItem = styled(Tab)(({ theme }) => ({
  marginRight: "8px !important",
  padding: "0 16px",

  "&.Mui-selected": {
    background: theme.palette.primary.main,
    color: "#fff",
  },
}));

const Event = ({ currentEvent }) => {
  const AuthUser = useAuthUser();
  const userInfo = useSelector(state => state.user.userInfo);
  const router = useRouter();

  const { isNew } = router.query;
  const isEdit = !isNew;

  const [activeTab, setActiveTab] = useState("1");

  const handleFieldChange = (field, event) => {
    const value = event.target.value;
    formik.setFieldValue(field, value);
  };

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const UserAddressSchema = Yup.object().shape({
    title: Yup.string().required("Título obrigatório"),
    description: Yup.string().required("Descrição obrigatória"),
    startDate: Yup.string().required("Data de início obrigatória"),
    endDate: Yup.string().required("Data final obrigatória"),
    additionalDescription: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      title: currentEvent?.title || "",
      startDate: currentEvent?.startDate || "",
      endDate: currentEvent?.endDate || "",
      description: currentEvent?.description || "",
      additionalDescription: currentEvent?.additionalDescription || "",
    },

    validationSchema: UserAddressSchema,
    onSubmit: async (values) => {
      try {
        if (isEdit) {
          return handleUpdateEvent(values);
        }

        const token = await AuthUser.getIdToken();
        const response = await fetch("/api/internal/events", {
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
          Toast.success("Evento cadastrado com sucesso!");

          if (process.browser) {
            window.location.href = `/internal/events/${data.createdEventId}`;
          }
        }
      } catch (err) {
        Toast.success("Erro ao criar Evento");
        console.log(err);
      }
    },
  });

  const handleUpdateEvent = async (values) => {
    try {
      const token = await AuthUser.getIdToken();
      const newValues = Object.assign(values);
      const response = await fetch("/api/internal/events", {
        method: "PUT",
        body: JSON.stringify({
          ...newValues,
          docId: currentEvent.docId,
          modifiedBy: userInfo.id,
        }),
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();

      if (data && data.success) {
        Toast.success("Evento atualizado com sucesso!");

        const event = new CustomEvent("CurrentEvent.reload");
        document.dispatchEvent(event);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const {
    errors,
    touched,
    isSubmitting,
    getFieldProps,
    setFieldValue,
    values,
  } = formik;

  return (
    <DashboardLayout>
      <Page title="Evento">
        <Container maxWidth="xl">
          <Card style={{ minHeight: 750 }}>
            <TabContext value={activeTab}>
              <TabsWrapper
                onChange={handleChange}
                TabIndicatorProps={{ style: { display: "none" } }}
              >
                <TabItem label="Evento" value="1" />
                <TabItem label="Participantes" value="2" disabled={isNew} />
              </TabsWrapper>
              <TabPanel value="1">
                <div style={{ padding: "18px 22px 0" }}>
                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                      justifyContent: "space-between",
                    }}
                    spacing={{ xs: 3, sm: 2 }}
                    mb={3}
                  >
                    <Typography variant="h5" paragraph>
                      Evento
                    </Typography>
                  </Stack>
                  <FormikProvider value={formik}>
                    <Form noValidate autoComplete="off">
                      <Grid container spacing={2}>
                        <Grid item sm={6} xs={12}>
                          <TextField
                            fullWidth
                            label="Título"
                            {...getFieldProps("title")}
                            error={Boolean(touched.title && errors.title)}
                            helperText={touched.title && errors.title}
                          />
                        </Grid>
                        <Grid item sm={3} xs={12}>
                          <InputDateTime
                            fullWidth
                            label="Data de início"
                            onChange={(date) =>
                              handleFieldChange("startDate", date)
                            }
                            value={formik.values.startDate}
                            error={Boolean(
                              touched.startDate && errors.startDate
                            )}
                            helperText={touched.startDate && errors.startDate}
                          />
                        </Grid>
                        <Grid item sm={3} xs={12}>
                          <InputDateTime
                            fullWidth
                            label="Data final"
                            onChange={(date) =>
                              handleFieldChange("endDate", date)
                            }
                            value={formik.values.endDate}
                            error={Boolean(touched.endDate && errors.endDate)}
                            helperText={touched.endDate && errors.endDate}
                          />
                        </Grid>
                      </Grid>

                      <Stack
                        direction={{ xs: "column", sm: "column" }}
                        spacing={{ xs: 3, sm: 2 }}
                        mt={3}
                      >
                        <TextField
                          multiline
                          rows={4}
                          label="Descrição"
                          {...getFieldProps("description")}
                          error={Boolean(
                            touched.description && errors.description
                          )}
                          helperText={touched.description && errors.description}
                        />

                        <QuillEditor
                          id="additional-description"
                          placeholder="Descrição Adicional"
                          value={values.additionalDescription}
                          onChange={(val) =>
                            setFieldValue("additionalDescription", val)
                          }
                          error={Boolean(
                            touched.additionalDescription &&
                              errors.additionalDescription
                          )}
                          helperText={
                            touched.additionalDescription &&
                            errors.additionalDescription
                          }
                        />
                      </Stack>
                      <Box
                        sx={{
                          mt: 3,
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <LoadingButton
                          type="button"
                          variant="outlined"
                          href="/internal/events"
                          style={{ marginRight: 14 }}
                        >
                          Cancelar
                        </LoadingButton>

                        <LoadingButton
                          type="submit"
                          variant="contained"
                          loading={isSubmitting}
                        >
                          Salvar
                        </LoadingButton>
                      </Box>
                    </Form>
                  </FormikProvider>
                </div>
              </TabPanel>
              <TabPanel value="2">
                <Participants currentEvent={currentEvent} />
              </TabPanel>
            </TabContext>
          </Card>
        </Container>
      </Page>
    </DashboardLayout>
  );
};

export const getServerSideProps = withAuthLevel(async (req, data, token) => {
  const id = req.params.id;
  const isNew = req.params.isNew;
  let currentEvent = null;

  if (isNew !== "true") {
    const response = await fetch(
      getAbsoluteUrl(`/api/internal/events?id=${id}`),
      {
        method: "GET",
        headers: {
          Authorization: token,
        },
      }
    );

    const data = await response.json();
    currentEvent = data;
  }

  const initialProps = {
    ...data,
  };

  if (currentEvent) {
    initialProps.currentEvent = currentEvent;
  }

  return {
    props: {
      ...initialProps,
    },
  };
});

Event.propTypes = {
  isEdit: PropTypes.bool,
  currentEvent: PropTypes.object,
};

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(Event);
