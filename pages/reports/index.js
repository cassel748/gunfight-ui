import { useState } from "react";
import Page from "src/components/Page";
import { withAuthLevel } from "src/utils/auth";
import DashboardLayout from "src/layouts/dashboard";
import { AuthAction, withAuthUser } from "next-firebase-auth";
import { TabList, TabContext, TabPanel } from "@material-ui/lab";
import { Card, Container, Tab } from "@material-ui/core";
import { experimentalStyled as styled } from "@material-ui/core/styles";
import Commmands from "./commands";

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
const Reports = ({}) => {
  const [activeTab, setActiveTab] = useState("1");

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  return (
    <DashboardLayout>
      <Page title="Relatórios">
        <Container maxWidth="xl">
          <Card style={{ minHeight: 800 }}>
            <TabContext value={activeTab}>
              <TabsWrapper
                onChange={handleChange}
                TabIndicatorProps={{ style: { display: "none" } }}
              >
                <TabItem label="Comandas" value="1" />
                {/*<TabItem label="Armas Vendidas" value="2" />
                <TabItem label="Munições" value="3" />*/}
              </TabsWrapper>

              <TabPanel value="1">
                <Commmands />
              </TabPanel>

              <TabPanel value="2"></TabPanel>

              <TabPanel value="3"></TabPanel>
            </TabContext>
          </Card>
        </Container>
      </Page>
    </DashboardLayout>
  );
};

export const getServerSideProps = withAuthLevel();

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(Reports);
