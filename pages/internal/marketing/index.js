import React, { useState } from "react";
import { CircularProgress, Container, Grid } from "@material-ui/core";
import MarketingFilter from "./filter";
import { printFile } from "src/utils/file";
import DashboardLayout from "src/layouts/dashboard";
import Page from "src/components/Page";

export default function Marketing({}) {
  const [isLoading, setIsLoading] = useState(false);

  const performGeneration = async (filter) => {
    try {
      setIsLoading(true);

      await printFile("/api/reports/marketing", filter, "pdf", null, "GET");
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Page title="Marketing">
        <Container maxWidth="xl">
          <Grid container spacing={3} p={3}>
            <Grid item xs={12}>
              <MarketingFilter onSearch={performGeneration} />

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
                  Gerando relatório, aguarde...
                </div>
              )}
            </Grid>
          </Grid>
        </Container>
      </Page>
    </DashboardLayout>
  );
}
