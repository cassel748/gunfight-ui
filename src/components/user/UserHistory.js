import { Card } from "@material-ui/core";
import { useState } from "react";
import dynamic from "next/dynamic";
import Tab from "@material-ui/core/Tab";
import TabList from "@material-ui/lab/TabList";
import TabPanel from "@material-ui/lab/TabPanel";
import TabContext from "@material-ui/lab/TabContext";
import { experimentalStyled as styled } from "@material-ui/core/styles";
import { useRouter } from "next/router";

const UserInChargeHistory = dynamic(() => import("./UserInChargeHistory"), {
  ssr: false,
});
const UserEventsHistory = dynamic(() => import("./UserEventsHistory"), {
  ssr: false,
});
const UserCommandItemsHistory = dynamic(
  () => import("./UserCommandItemsHistory"),
  {
    ssr: false,
  }
);
const UserContactHistory = dynamic(() => import("./UserContactHistory"), {
  ssr: false,
});
const QuantityItemsHistory = dynamic(() => import("./QuantityItemsHistory"), {
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

export default function UserHistory({ userId }) {
  const { query } = useRouter();
  
  const [activeTab, setActiveTab] = useState(query.tab || "1");

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Card style={{ minHeight: 568 }}>
      <TabContext value={activeTab}>
        <TabsWrapper
          onChange={handleChange}
          TabIndicatorProps={{ style: { display: "none" } }}
        >
          <TabItem label="Comandas" value="1" />
          <TabItem label="Itens" value="4" />
          <TabItem label="Quantidades" value="5" />
          <TabItem label="Contato" value="2" />
          <TabItem label="Habitualidades" value="3" />
        </TabsWrapper>

        <TabPanel value="1">
          <UserInChargeHistory userId={userId} />
        </TabPanel>

        <TabPanel value="2">
          <UserContactHistory userId={userId} />
        </TabPanel>

        <TabPanel value="3">
          <UserEventsHistory userId={userId} />
        </TabPanel>
        <TabPanel value="4">
          <UserCommandItemsHistory userId={userId} />
        </TabPanel>
        <TabPanel value="5">
          <QuantityItemsHistory userId={userId} />
        </TabPanel>
      </TabContext>
    </Card>
  );
}
