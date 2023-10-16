import Page from "src/components/Page";
import { generateId, withAuthLevel } from "src/utils/auth";
import CardImage from "src/components/Card-Image";
import DashboardLayout from "src/layouts/dashboard";
import { Container, Grid, Skeleton } from "@material-ui/core";
import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import {
  AppTotalUsers,
  AppTotalInativeUsers,
  AppTotalAffiliateUsers,
} from "src/components/dashboard/general-app";
import AnalyticsCurrentVisits from "src/components/dashboard/general-app/AnalyticsCurrentVisits";
import { useEffect, useState } from "react";

// ----------------------------------------------------------------------

function HomePage() {
  const AuthUser = useAuthUser();
  const generatedId = generateId();
  const [chartData, setChartData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const retrieveData = async () => {
    try {
      setIsLoading(true);

      let url = "/api/associate/data?action=CHART_DATA";
      const token = await AuthUser.getIdToken();
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();
      setChartData(data);
    } catch (err) {
      console.log(err);
      setChartData({});
    }
    setIsLoading(false);
  };

  useEffect(() => {
    retrieveData();
  }, []);

  return (
    <DashboardLayout>
      <Page title="Início">
        <Container maxWidth="xl">
          <Grid
            mt={4}
            container
            spacing={3}
            sx={{
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Grid item xs={6} md={3}>
              <CardImage
                title="Incluir Associado"
                href={`/associates/register/${generatedId}?isNew=true`}
                image="https://images.unsplash.com/photo-1566566716921-b50e82140547?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2338&q=80"
              />
            </Grid>

            <>
              <Grid item xs={6} md={3} mt={2}>
                {!isLoading ? (
                  <AppTotalUsers chartData={chartData} />
                ) : (
                  <Skeleton
                    width={300}
                    height={200}
                    variant="rect"
                    sx={{ borderRadius: 3 }}
                  />
                )}
              </Grid>

              <Grid item xs={6} md={3} mt={2}>
                {!isLoading ? (
                  <AppTotalAffiliateUsers chartData={chartData} />
                ) : (
                  <Skeleton
                    width={300}
                    height={200}
                    variant="rect"
                    sx={{ borderRadius: 3 }}
                  />
                )}
              </Grid>
              <Grid item xs={6} md={3} mt={2}>
                {!isLoading ? (
                  <AppTotalInativeUsers chartData={chartData} />
                ) : (
                  <Skeleton
                    width={300}
                    height={200}
                    variant="rect"
                    sx={{ borderRadius: 3 }}
                  />
                )}
              </Grid>
            </>
          </Grid>
          <Grid container spacing={3} mt={1}>
            {chartData.userTypes ? (
              <Grid item xs={12} md={6} lg={6}>
                <AnalyticsCurrentVisits userTypes={chartData?.userTypes} />
              </Grid>
            ) : (
              <Grid item xs={12} md={6} lg={6}>
                <Skeleton
                  width={600}
                  height={400}
                  variant="rect"
                  sx={{ borderRadius: 3 }}
                />
              </Grid>
            )}
          </Grid>
        </Container>
      </Page>
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuthLevel();

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(HomePage);

{
  /* {!isLoading && (
                <BookingWidgetSummary
                  total={chartData?.total}
                  title="Total usuários"
                  icon={<BookingIllustration />}
                />
              )} */
}
