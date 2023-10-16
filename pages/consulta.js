import React, { useEffect, useState } from "react";
import { LoadingButton } from "@material-ui/lab";
import { Form, FormikProvider, useFormik } from "formik";
import {
  Grid,
  Card,
  Stack,
  TextField,
  Typography,
  Container,
  CircularProgress,
  Alert,
  AlertTitle,
} from "@material-ui/core";
import { useRouter } from "next/router";
import SearchIcon from "@material-ui/icons/Search";
import { experimentalStyled as styled } from "@material-ui/core/styles";
import LogoText from "src/components/LogoText";
import { formatCpf } from "src/utils/string";
import Label from "src/components/Label";
import { getDateLocalized } from "src/utils/localizedDateFns";

const iconSize =  {
  width: 80,
  height: 80
};

const LabelText = styled("div")(() => ({
  marginBottom: 8,
  strong: {
    display: "inline-block",
    marginRight: 8,
    color: "#9f9f9f"
  }
}));

function Consulta() {
  const [ showSearchTip, setShowSearchTip ] = useState(false);
  const [ disabledSearchField, setDisabledSearchField ] = useState(false);
  const [ isLoading, setIsLoading ] = useState(true);
  const [ declarationStatus, setDeclarationStatus ] = useState(null);
  const [ declarationData, setDeclarationData ] = useState({});

  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setShowSearchTip(true);
    } else {
      handleToken(token);
    }
  }, [token]);

  const formik = useFormik({
    initialValues: {
      token
    },
    onSubmit: (values) => {
      setShowSearchTip(false);
      handleToken(values.token);
    },
  });

  const { errors, touched, getFieldProps } = formik;

  const handleToken = async (token) => {
    setDisabledSearchField(true);
    
    try {
      setIsLoading(true);

      const response = await fetch(`/api/associate/declaration/validate?token=${token}`, {
        method: "GET"
      });

      const data = await response.json();

      setDeclarationStatus(data.status)
      setDeclarationData(data);
    } catch(e) {
      console.log(e); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <div style={{ padding: 12, display: "flex", alignItems: "center", marginBottom: -24, marginTop: 24, justifyContent: "center" }}>
        <LogoText width={250} height={84} />
      </div>

      <FormikProvider value={formik}>
        <Form noValidate autoComplete="off">
          <Card sx={{ p: 3 }} style={{ marginTop: 44 }}>
            <Grid spacing={{ xs: 3, sm: 2 }}>
              <Typography variant="h5" paragraph>
                Consulta Declaração
              </Typography>
            </Grid>
            <Stack
              spacing={3}
              mt={3}
              direction={{
                xs: "column",
                sm: "row",
                justifyContent: "space-between",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "column" }}
                spacing={{ xs: 3, sm: 2 }}
                sx={{ width: "100%" }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 3, sm: 2 }}
                >
                  <TextField
                    fullWidth
                    label="Número da Declaração"
                    {...getFieldProps("token")}
                    disabled={disabledSearchField}
                    error={Boolean(touched.affiliationNumber && errors.affiliationNumber)}
                    helperText={touched.affiliationNumber && errors.affiliationNumber}
                  />
                </Stack>
              </Stack>

              <Stack
                direction={{
                  xs: "row",
                  sm: "row",
                }}
                spacing={{ xs: 3 }}
              >
                <LoadingButton
                  fullWidth
                  type="submit"
                  loading={false}
                  variant="contained"
                  disabled={disabledSearchField}
                >
                  Consultar
                </LoadingButton>
              </Stack>
            </Stack>
          </Card>
        </Form>
      </FormikProvider>

      <Card sx={{ p: 3 }} style={{ marginTop: 44, minHeight: 430 }}>
        <Typography variant="h5" paragraph>
          Resultado da Consulta
        </Typography>

        {
          showSearchTip && (
            <div style={{ textAlign: "center", padding: "22px 0" }}>
              <SearchIcon style={{ ...iconSize, color: "#f23445" }}/><br />
              Insira o Número da Declaração e clique em consultar
            </div>
          )
        }

        {
          isLoading && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", height: 330 }}>
              <CircularProgress />
              <br />
              <br />
              Carregando...
            </div>
          )
        }

        {
          !isLoading &&
          declarationStatus === "V" && (
            <>
            <Alert severity="success">
              <AlertTitle>Declaração Válida</AlertTitle>
              Declaração validada com sucesso!
            </Alert>

            <div style={{ marginTop: 22 }}>
              <Typography variant="h5" paragraph>
                {declarationData.name}
              </Typography>

              <LabelText>
                <strong>Código da Declaração:</strong>
                {declarationData.code}
              </LabelText>
              <LabelText>
                <strong>Nº Associação:</strong>
                {declarationData.number}
              </LabelText>
              <LabelText>
                <strong>CPF:</strong>
                {formatCpf(declarationData.document)}
              </LabelText>
              <LabelText>
                <strong>Emitida em:</strong>
                {getDateLocalized(new Date(declarationData.createdDate), "dd/MM/yyyy")}
              </LabelText>
              <LabelText>
                <strong>Expira em:</strong>
                {getDateLocalized(new Date(declarationData.expiration), "dd/MM/yyyy")}
              </LabelText>
              <LabelText>
                <strong>Situação do Associado na Data de Emissão:</strong><br />
                {
                  declarationData.associateRegular ? 
                    <Label
                      variant="filled"
                      color="success"
                    >
                      Regular
                    </Label>
                   :
                    <Label
                      variant="filled"
                      color="error"
                    >
                      Com Pendências
                    </Label>
                }
              </LabelText>
            </div>
            </>
          )
        }

        {
          !isLoading &&
          declarationStatus === "E" && (
            <Alert severity="error">
              <AlertTitle>Declaração Inválida</AlertTitle>
              Essa declaração expirou!
            </Alert>
          )
        }

        {
          !isLoading &&
          declarationStatus === "I" && (
            <Alert severity="warning">
              <AlertTitle>Declaração Inválida</AlertTitle>
              Verifique o número da Declaração!
            </Alert>
          )
        }
        
      </Card>
    </Container>
  );
}

export default Consulta;
