import DashboardLayout from "src/layouts/dashboard";
import Page from "src/components/Page";
import { AuthAction, withAuthUser } from "next-firebase-auth";
import { withAuthLevel } from "src/utils/auth";
import PageDev from "src/components/page-dev";

function Schedules() {
  return (
    <DashboardLayout>
      <Page title="Agendamentos">
        <PageDev />
      </Page>
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuthLevel();

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(Schedules);
