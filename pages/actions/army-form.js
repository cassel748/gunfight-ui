import React, { useState } from "react";
import Page from "src/components/Page";
import { printFile } from "src/utils/file";
import ArmyFilter from "pages/reports/army";
import { withAuthLevel } from "src/utils/auth";
import DashboardLayout from "src/layouts/dashboard";
import { Container, Typography } from "@material-ui/core";
import { CircularProgress, Grid } from "@material-ui/core";
import { AuthAction, withAuthUser } from "next-firebase-auth";

function ArmyForm() {
  const [isLoading, setIsLoading] = useState(false);

  const performGeneration = async (filter) => {
    try {
      setIsLoading(true);

      await printFile("/api/reports/ammo-army", filter, "pdf", null, "GET");
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <DashboardLayout>
      <Page title="Formulário Exército">
        <Container maxWidth="xl">
          <Typography variant="h3" component="h1" paragraph>
            Exército
          </Typography>
          <ArmyFilter onSearch={performGeneration} />

          {isLoading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                height: 330,
              }}
            >
              <CircularProgress />
              <br />
              <br />
              Gerando relatório demonstrativo de saída de munições, aguarde...
            </div>
          )}
        </Container>
      </Page>
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuthLevel();

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(ArmyForm);
