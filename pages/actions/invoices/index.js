import { useState, useEffect } from "react";
import firebase from "firebase/app";
import Page from "src/components/Page";
import { useSelector } from "react-redux";
import { USER_TYPE, withAuthLevel } from "src/utils/auth";
import clock from "@iconify/icons-eva/clock-fill";
import Command from "src/utils/mock-list/command";
import DashboardLayout from "src/layouts/dashboard";
import FormCommand from "src/components/command/form";
import { DialogAnimate } from "src/components/animate";
import StartCommand from "src/components/command/start";
import CommandDetail from "src/components/command/detail";
import roundReceipt from "@iconify/icons-ic/round-receipt";
import useStyles from "src/components/command/detail/styles";
import { getDateLocalized } from "src/utils/localizedDateFns";
import CommandFinalize from "src/components/command/finalize";
import CommandCompleted from "src/components/command/completed";
import { TabList, TabContext, TabPanel } from "@material-ui/lab";
import checkmark from "@iconify/icons-eva/checkmark-circle-2-fill";
import trendingDownFill from "@iconify/icons-eva/trending-down-fill";
import InvoiceAnalytic from "src/components/command/invoice-analystic";
import { experimentalStyled as styled } from "@material-ui/core/styles";
import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import {
  Grid,
  Tab,
  Card,
  Stack,
  Divider,
  Skeleton,
  useTheme,
  Container,
} from "@material-ui/core";

let firstCall = true;
let lastFilter = null;

const TabsWrapper = styled(TabList)(({}) => ({
  marginTop: 18,
}));

const TabItem = styled(Tab)(({ theme }) => ({
  borderRadius: 8,
  padding: "0 16px",
  marginRight: "8px !important",
  color: theme.palette.primary.main,
  border: `2px solid ${theme.palette.primary.main}`,

  "&.Mui-selected": {
    color: "#fff",
    background: theme.palette.primary.main,
  },
}));

function Commands() {
  const classes = useStyles();
  const AuthUser = useAuthUser();
  const [startCommand, setStartCommand] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [openCommandFinalize, setOpenCommandFinalize] = useState(false);
  const [localInvoiceId, setLocalInvoiceId] = useState(null);
  const [isLoadingOpened, setIsLoadingOpened] = useState(true);
  const [invoiceList, setInvoiceList] = useState([]);
  const [commandData, setCommandData] = useState({});

  const theme = useTheme();

  const userInfo = useSelector((state) => state.user.userInfo);

  const goToCommandFinalize = (command) => {
    setOpenCommandFinalize(true);
    setCommandData(command);
  };

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);

    if (invoiceList.length === 0 && firstCall) {
      getInvoiceList(newValue);
    }
  };
  const handleOpenStartCommand = () => {
    setStartCommand(true);
  };

  const handleCloseStartCommand = () => {
    setStartCommand(false);
    setLocalInvoiceId(null);
    window.history.replaceState(null, "", "/actions/invoices");
  };

  const performSearch = async (filter) => {
    if (filter && filter.status && filter.status !== activeTab) {
      setActiveTab(filter.status + "");
    } else {
      setActiveTab("1");
    }

    if (filter) {
      lastFilter = filter;
    }

    await getInvoiceList(filter.status, filter.date, filter.invoiceId);
  };

  const getInvoiceList = async (status, date, invoiceId, showLoader) => {
    try {
      if (showLoader !== false) {
        setIsLoadingOpened(true);
      }

      const today = getDateLocalized(new Date(), "MM-dd-yyyy");
      let url = `/api/invoice?status=${status ? status : "open"}&createdDate=${
        date ? date : today
      }`;

      if (invoiceId) {
        url += `&invoiceId=${invoiceId}`;
      }

      const token = await AuthUser.getIdToken();
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      if (firstCall) {
        firstCall = false;
      }

      const data = await response.json();

      setInvoiceList(data);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoadingOpened(false);
    }
  };

  const checkInvoices = async () => {
    // Update when new invoice added by other users
    firebase
      .firestore()
      .collection("invoices")
      .onSnapshot(() => {
        if (lastFilter) {
          return getInvoiceList(
            lastFilter.status,
            lastFilter.date,
            lastFilter.invoiceId,
            false
          );
        }

        getInvoiceList("open");
      });
  };

  useEffect(() => {
    checkInvoices();
  }, []);

  useEffect(() => {
    const handleInvoiceScan = (event) => {
      const invoiceId = event.detail.invoiceId;

      if (invoiceId && invoiceId.length === 4) {
        setLocalInvoiceId(invoiceId);
        handleOpenStartCommand();
      }
    };

    document.addEventListener("BarcodeScanner.newScan", handleInvoiceScan);
    return () =>
      document.removeEventListener("BarcodeScanner.newScan", handleInvoiceScan);
  }, []);

  const totalValueInvoice = invoiceList
    .filter((item) => item.total !== undefined)
    .map((item) => item.total)
    .reduce((prev, curr) => prev + curr, 0);

  const totalValuePaidInvoice = invoiceList
    .filter((item) => item.status === 3)
    .map((item) => item.total)
    .reduce((prev, curr) => prev + curr, 0);

  const totalDiscount = invoiceList
    .filter((item) => item.discount !== 0)
    .map((item) => item.discount)
    .reduce((prev, curr) => prev + curr, 0);

  let opened =
    invoiceList && invoiceList.filter
      ? invoiceList.filter((item) => item.status === 1)
      : [];
  let finished =
    invoiceList && invoiceList.filter
      ? invoiceList.filter((item) => item.status === 2)
      : [];
  let paid =
    invoiceList && invoiceList.filter
      ? invoiceList.filter((item) => item.status === 3)
      : [];

  let discount =
    invoiceList && invoiceList.filter
      ? invoiceList.filter((item) => item.discount !== 0)
      : [];

  const legend = () => (
    <div>
      <div className={classes.row}>
        <div className={classes.iconLegend} />
        <p>Sócio</p>
      </div>
      <div className={classes.row}>
        <div className={classes.iconLegendBlue} />
        <p>Não Sócio</p>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <Page title="Comandas">
        <Container maxWidth="xl">
          <StartCommand
            openStartCommand={handleOpenStartCommand}
            onSearch={performSearch}
            onClear={() => {
              getInvoiceList("open");
              setActiveTab("1");
              lastFilter = null;
            }}
          />

          <TabContext value={activeTab}>
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={{ xs: 3 }}
              mb={2}
            >
              <TabsWrapper
                onChange={handleChange}
                TabIndicatorProps={{ style: { display: "none" } }}
              >
                <TabItem
                  label={`${
                    opened && opened.length ? `( ${opened.length} ) ` : ""
                  }Em aberto`}
                  value="1"
                />
                {/* <TabItem label={`${finished && finished.length ? `( ${finished.length} ) ` : ""}Finalizadas`} value="2" /> */}
                <TabItem
                  label={`${
                    paid && paid.length ? `( ${paid.length} ) ` : ""
                  }Pagas`}
                  value="3"
                />
                {legend()}
              </TabsWrapper>
            </Stack>
            <Card sx={{ minHeight: 800 }}>
              {userInfo?.accessLevel >= USER_TYPE.MANAGER && (
                <Stack
                  direction="row"
                  divider={
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{ borderStyle: "dashed" }}
                    />
                  }
                  sx={{ py: 2 }}
                >
                  <InvoiceAnalytic
                    title="Total"
                    total={opened?.length + paid?.length}
                    percent={100}
                    price={totalValueInvoice}
                    icon={roundReceipt}
                    color={theme.palette.info.main}
                  />
                  <InvoiceAnalytic
                    title="Pagas"
                    total={paid && paid.length ? paid.length : ""}
                    percent={100}
                    price={totalValuePaidInvoice}
                    icon={checkmark}
                    color={theme.palette.success.main}
                  />
                  <InvoiceAnalytic
                    title="Em aberto"
                    total={opened && opened.length ? opened.length : ""}
                    percent={100}
                    price={totalValueInvoice - totalValuePaidInvoice}
                    icon={clock}
                    color={theme.palette.warning.main}
                  />
                </Stack>
              )}
              <TabPanel value="1">
                <Grid
                  container
                  spacing={2}
                  sx={{ p: 5 }}
                  style={{ padding: 24 }}
                >
                  {isLoadingOpened ? (
                    <>
                      <Grid item xs={12} sm={6} md={3} spacing={2}>
                        <Skeleton
                          variant="rect"
                          height={266}
                          style={{ borderRadius: 8 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} spacing={2}>
                        <Skeleton
                          variant="rect"
                          height={266}
                          style={{ borderRadius: 8 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} spacing={2}>
                        <Skeleton
                          variant="rect"
                          height={266}
                          style={{ borderRadius: 8 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} spacing={2}>
                        <Skeleton
                          variant="rect"
                          height={266}
                          style={{ borderRadius: 8 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} spacing={2}>
                        <Skeleton
                          variant="rect"
                          height={266}
                          style={{ borderRadius: 8 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} spacing={2}>
                        <Skeleton
                          variant="rect"
                          height={266}
                          style={{ borderRadius: 8 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} spacing={2}>
                        <Skeleton
                          variant="rect"
                          height={266}
                          style={{ borderRadius: 8 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} spacing={2}>
                        <Skeleton
                          variant="rect"
                          height={266}
                          style={{ borderRadius: 8 }}
                        />
                      </Grid>
                    </>
                  ) : (
                    <CommandDetail commands={opened} type={1} />
                  )}

                  {!isLoadingOpened && opened.length === 0 ? (
                    <div
                      style={{
                        width: "100%",
                        height: 300,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      <img
                        src="/static/mock-images/box.png"
                        alt="Nenhum item encontrado"
                        width={85}
                      />
                      <span
                        style={{
                          display: "block",
                          marginTop: 14,
                          fontWeight: "bold",
                        }}
                      >
                        Nenhuma comanda em aberto
                      </span>
                    </div>
                  ) : null}
                </Grid>
              </TabPanel>

              <TabPanel value="2">
                <Grid container spacing={2} sx={{ p: 5 }}>
                  {isLoadingOpened ? (
                    <>
                      <Grid item xs={6} md={3} spacing={2}>
                        <Skeleton
                          variant="rect"
                          width={306}
                          height={266}
                          style={{ borderRadius: 8 }}
                        />
                      </Grid>
                      <Grid item xs={6} md={3} spacing={2}>
                        <Skeleton
                          variant="rect"
                          width={306}
                          height={266}
                          style={{ borderRadius: 8 }}
                        />
                      </Grid>
                      <Grid item xs={6} md={3} spacing={2}>
                        <Skeleton
                          variant="rect"
                          width={306}
                          height={266}
                          style={{ borderRadius: 8 }}
                        />
                      </Grid>
                      <Grid item xs={6} md={3} spacing={2}>
                        <Skeleton
                          variant="rect"
                          width={306}
                          height={266}
                          style={{ borderRadius: 8 }}
                        />
                      </Grid>
                      <Grid item xs={6} md={3} spacing={2}>
                        <Skeleton
                          variant="rect"
                          width={306}
                          height={266}
                          style={{ borderRadius: 8 }}
                        />
                      </Grid>
                      <Grid item xs={6} md={3} spacing={2}>
                        <Skeleton
                          variant="rect"
                          width={306}
                          height={266}
                          style={{ borderRadius: 8 }}
                        />
                      </Grid>
                      <Grid item xs={6} md={3} spacing={2}>
                        <Skeleton
                          variant="rect"
                          width={306}
                          height={266}
                          style={{ borderRadius: 8 }}
                        />
                      </Grid>
                      <Grid item xs={6} md={3} spacing={2}>
                        <Skeleton
                          variant="rect"
                          width={306}
                          height={266}
                          style={{ borderRadius: 8 }}
                        />
                      </Grid>
                    </>
                  ) : (
                    <CommandDetail
                      commands={finished}
                      finalizeCommand={goToCommandFinalize}
                      type={2}
                    />
                  )}

                  {!isLoadingOpened && finished.length === 0 ? (
                    <div
                      style={{
                        width: "100%",
                        height: 300,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      <img
                        src="/static/mock-images/box.png"
                        alt="Nenhum item encontrado"
                        width={85}
                      />
                      <span
                        style={{
                          display: "block",
                          marginTop: 14,
                          fontWeight: "bold",
                        }}
                      >
                        Nenhuma comanda finalizada
                      </span>
                    </div>
                  ) : null}
                </Grid>
              </TabPanel>

              <TabPanel value="3">
                <Grid container spacing={2} sx={{ pt: 2 }}>
                  <CommandCompleted
                    commands={paid.sort(function (a, b) {
                      return new Date(b.finishedAt) - new Date(a.finishedAt);
                    })}
                    type={3}
                  />
                </Grid>
              </TabPanel>

              <DialogAnimate
                widthMax={600}
                open={openCommandFinalize}
                onClose={() => setOpenCommandFinalize(false)}
              >
                <CommandFinalize
                  widthMax={600}
                  handleClose={() => {
                    setOpenCommandFinalize(false);
                    setCommandData({});
                  }}
                  invoiceData={commandData}
                  associateData={commandData}
                />
              </DialogAnimate>
            </Card>
          </TabContext>
        </Container>

        <DialogAnimate
          widthMax={600}
          open={startCommand}
          onClose={handleCloseStartCommand}
        >
          <FormCommand
            handleClose={handleCloseStartCommand}
            invoiceId={localInvoiceId}
          />
        </DialogAnimate>
      </Page>
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuthLevel();

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(Commands);
