import React, { useEffect, useState } from "react";
import firebase from "firebase/app";
import Toast from "src/utils/toast";
import { Icon } from "@iconify/react";
import Page from "src/components/Page";
import { useRouter } from "next/router";
import { groupBy } from "src/utils/array";
import { useSelector } from "react-redux";
import { printFile } from "src/utils/file";
import Confirm from "src/components/Confirm";
import { Box, Tab } from "@material-ui/core";
import { LoadingButton } from "@material-ui/lab";
import NextLink from "src/components/Button/Link";
import eyeFill from "@iconify/icons-eva/eye-fill";
import { formatCurrency } from "src/utils/string";
import DashboardLayout from "src/layouts/dashboard";
import SvgIconStyle from "src/components/SvgIconStyle";
import { DialogAnimate } from "src/components/animate";
import { USER_TYPE, withAuthLevel } from "src/utils/auth";
import CommandFinalize from "src/components/command/finalize";
import { getDateLocalized } from "src/utils/localizedDateFns";
import { TabList, TabContext, TabPanel } from "@material-ui/lab";
import { RestrictedButton } from "src/components/RestrictedButton";
import AddConsumption from "src/components/command/add-consumption";
import CommandInvoiceList from "src/components/command/invoice-list";
import { experimentalStyled as styled } from "@material-ui/core/styles";
import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import AddConsumptionAssociated from "src/components/command/add-consumption-associated";
import {
  getPaymentForm,
  verifyTypeUser,
  getPaymentFormIcon,
} from "src/utils/enums";
import {
  Card,
  Grid,
  Stack,
  Avatar,
  Skeleton,
  Container,
  Typography,
  IconButton,
} from "@material-ui/core";

const StatusWrapper = styled("div")(() => ({
  flex: "1",
  marginTop: 8,
}));

const PaymentForm = styled("div")(() => ({
  marginTop: 8,
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
}));

const AssociateNameTag = styled("label")(() => ({
  fontWeight: "bold",
  color: "#F23545",
}));

const ValueBalanceTag = styled("label")(({ balanceValue }) => ({
  fontWeight: "bold",
  color: balanceValue < 0 ? "#F23545" : "#4f19",
}));

const StatusTag = styled("div")(({ color }) => ({
  height: 32,
  color: "#fff",
  minWidth: 115,
  borderRadius: 8,
  alignItems: "center",
  padding: "3px 12px",
  display: "inline-flex",
  backgroundColor: color,
  justifyContent: "center",
}));

const TabItem = styled(Tab)(({ theme }) => ({
  borderTopLeftRadius: 8,
  borderTopLeftRadius: 8,
  padding: "0 16px",
  marginRight: "10px !important",
  background: theme.palette.background.default,

  "&.Mui-selected": {
    background: theme.palette.background.paper,
  },
}));

const TypographyLocal = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.lighter,
  cursor: "pointer",

  "&:hover": {
    textDecoration: "underline",
  },
}));

const CommandInvoice = () => {
  const [openedDialog, setOpenedDialog] = useState(false);
  const [editItem, setEditItem] = useState();
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [openCommandFinalize, setOpenCommandFinalize] = useState(false);
  const [openedDialogAmmoCheck, setOpenedDialogAmmoCheck] = useState(false);
  const [invoiceData, setInvoiceData] = useState({});
  const [associateData, setAssociateData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPrint, setIsLoadingPrint] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [currentDeleteItem, setCurrentDeleteItem] = useState({});
  const [ammoCheckList, setAmmoCheckList] = useState([]);
  const [openedSimpleInvoiceFinish, setOpenedSimpleInvoiceFinish] = useState(
    false
  );
  const [isLoadingSimpleFinish, setIsLoadingSimpleFinish] = useState(false);
  const [isLoadingReopen, setIsLoadingReopen] = useState(false);
  const [formTab, setFormTab] = useState("1");
  const [finisherData, setFinisherData] = useState({});
  const [modalBalance, setModalBalance] = useState(false);

  const AuthUser = useAuthUser();
  const userInfo = useSelector((state) => state.user.userInfo);

  const router = useRouter();
  const { id } = router.query;

  const getStatusColor = (status) => {
    if (status === 1) {
      return "#f44336";
    }

    if (status === 2) {
      return "#0d47a1";
    }

    if (status === 3) {
      return "#4caf50";
    }
  };

  const itemsDiscount = invoiceItems
    .filter((item) => item.itemDiscount !== undefined)
    .map((item) => item.itemDiscount)
    .reduce((prev, curr) => prev + curr, 0);

  const haveAnuidade = invoiceItems
    .filter((item) => item.productId !== undefined)
    .map((item) => item.productId);

  // console.log("haveAnuidade: ", haveAnuidade)

  const checkItemDiscounts = async () => {
    // Update when new invoice added by other users
    firebase
      .firestore()
      .collection("invoices")
      .doc(id)
      .onSnapshot((invoiceDoc) => {
        const invoice = {
          id: invoiceDoc.id,
          ...invoiceDoc.data(),
        };

        setInvoiceData(invoice);

        if (!invoice || (invoice && !invoice.associateId)) {
          router.replace("/actions/invoices");
        }

        if (invoice && invoice.status === 3) {
          firebase
            .firestore()
            .collection("user-data")
            .doc(invoice.finishedBy)
            .onSnapshot((doc) => {
              const finisherData = {
                id: doc.id,
                ...doc.data(),
              };

              setFinisherData(finisherData);
            });
        }

        firebase
          .firestore()
          .collection("associate-data")
          .doc(invoice.associateId)
          .onSnapshot((doc) => {
            const associate = {
              id: doc.id,
              ...doc.data(),
            };

            setAssociateData(associate);
          });

        firebase
          .firestore()
          .collection("invoice-items")
          .where("invoiceId", "==", invoiceDoc.id)
          .where("status", "!=", "D")
          .onSnapshot((invoiceItemsDoc) => {
            const invoiceItems = [];
            invoiceItemsDoc.docs.forEach((doc) => {
              invoiceItems.push({
                docId: doc.id,
                ...doc.data(),
              });
            });

            //setInvoiceItems(groupBy(invoiceItems, "productId"));
            setInvoiceItems(invoiceItems);

            setIsLoadingItems(false);
          });
      });
  };

  useEffect(() => {
    checkItemDiscounts();
  }, [itemsDiscount]);

  const getInvoiceStatus = (status) => {
    if (status === 1) {
      return "Em aberto";
    }

    if (status === 2) {
      return "Finalizada/Não Paga";
    }

    if (status === 3) {
      return "Paga";
    }
  };

  const goToAmmoCheck = (items) => {
    setOpenedDialogAmmoCheck(true);
    setAmmoCheckList(items);
  };

  const goToCommandFinalize = () => {
    setOpenCommandFinalize(true);
  };

  const goToSimpleInvoiceFinish = () => {
    setOpenedSimpleInvoiceFinish(true);
  };

  const handleSimpleFinish = async () => {
    setIsLoadingSimpleFinish(true);
    await updateInvoice({ status: 3 }, "Comanda finalizada com sucesso!")();
    setIsLoadingSimpleFinish(false);
    setOpenedSimpleInvoiceFinish(false);
  };

  const onReopenInvoice = async () => {
    setIsLoadingReopen(true);

    // UPDATE THIS CALC TO USE ITEM DISCOUNT WHEN IT IS ON THE CODE
    const total = invoiceItems.reduce(function (a, b) {
      return a + b.itemTotal;
    }, 0);

    await updateInvoice(
      { status: 1, discount: invoiceData.paymentDiscount || 0, total },
      "Comanda reaberta com sucesso!"
    )();
    setIsLoadingReopen(false);
  };

  const updateInvoice = (payload, message) => async () => {
    try {
      setIsLoading(true);
      const newPayload = Object.assign(invoiceData, payload);
      const token = await AuthUser.getIdToken();
      const response = await fetch("/api/invoice", {
        method: "PUT",
        body: JSON.stringify({
          ...newPayload,
          docId: id,
          modifiedBy: userInfo.id,
          discount: itemsDiscount,
        }),
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();

      if (data && data.success) {
        Toast.success(message || "Comanda atualizada com sucesso!");
      }

      if (data && data.success === false && data.message) {
        Toast.error(data.message);
      }
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  const handleDeleteItem = async () => {
    try {
      setIsLoadingDelete(true);
      const token = await AuthUser.getIdToken();
      const response = await fetch(
        `/api/invoice/item${
          currentDeleteItem.fromInventory ? "?action=DELETE_FROM_INVENTORY" : ""
        }`,
        {
          method: "DELETE",
          body: JSON.stringify({
            invoiceId: invoiceData.id,
            docId: currentDeleteItem.docId,
            productId: currentDeleteItem.productId,
            deletedBy: userInfo.id,
            quantity: currentDeleteItem.quantity,
          }),
          headers: {
            Authorization: token,
          },
        }
      );

      const data = await response.json();

      if (data && data.success) {
        Toast.success("Item removido com sucesso!");
        setIsOpenDeleteDialog(false);
      }

      if (data && data.success === false && data.message) {
        Toast.error(data.message);
      }
    } catch (e) {
      console.log(e);
    }
    setIsLoadingDelete(false);
  };

  const onRemoveCommandItem = (item) => {
    setCurrentDeleteItem(item);
    setIsOpenDeleteDialog(true);
  };

  const onFinishInvoice = () => {
    return goToCommandFinalize();
  };

  const print = (invoiceId) => async () => {
    try {
      setIsLoadingPrint(true);
      await printFile(`/api/invoice/print/${invoiceId}`, {});
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoadingPrint(false);
    }
  };

  const verifyBalance = (balance) => {
    if (balance === 0) {
      return "Não contém saldo";
    }
    if (balance < 1) {
      return "Contém pendências";
    }
    if (balance > 1) {
      return "Contém saldo";
    }
  };

  const openModalBalance = () => {
    setModalBalance(true);
  };

  return (
    <DashboardLayout>
      <Page title="Dados da Comanda">
        <Container maxWidth="xl">
          <Card sx={{ flex: 1 }}>
            <Stack
              direction={{
                xs: "column",
                sm: "row",
                justifyContent: "space-between",
              }}
              p={3}
            >
              <Typography variant="h5" paragraph>
                Comanda
              </Typography>

              <Typography variant="h5" paragraph>
                {invoiceData && invoiceData.invoiceId ? (
                  "#" + invoiceData.invoiceId
                ) : (
                  <Skeleton variant="rect" width={50} height={30} />
                )}
              </Typography>
            </Stack>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
                justifyContent: "space-between",
              }}
              mt={2}
              pr={3}
              pl={3}
            >
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                  justifyContent: "space-between",
                }}
              >
                {associateData && associateData.name ? (
                  <Avatar
                    sx={{ height: 50, width: 50 }}
                    alt={`Imagem de ${associateData.name}`}
                    src={
                      associateData.profilePhoto
                        ? associateData.profilePhoto
                        : "/static/mock-images/avatars/avatar_default.jpg"
                    }
                  />
                ) : (
                  <Skeleton variant="circular" width={50} height={50} />
                )}

                <Stack ml={2}>
                  <Typography style={{ fontWeight: "bold" }}>
                    {verifyTypeUser(associateData.internalUserType)}
                    {associateData.internalUserType === 6 &&
                      ` de ${associateData.spouseName}`}
                  </Typography>
                  <NextLink
                    href={`/associates/register/${invoiceData.associateId}`}
                  >
                    <TypographyLocal mt={1}>
                      {invoiceData && invoiceData.invoiceId ? (
                        invoiceData.associateNumber +
                        " - " +
                        invoiceData.associateName
                      ) : (
                        <Skeleton variant="rect" width={400} height={24} />
                      )}
                    </TypographyLocal>
                  </NextLink>
                </Stack>
              </Stack>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                  justifyContent: "space-between",
                }}
              >
                <Stack ml={4}>
                  <div style={{ display: "flex", flexDirection: "row" }}>
                    <Typography fontWeight="bold">Carteira</Typography>
                    <IconButton
                      onClick={openModalBalance}
                      edge="end"
                      sx={{ height: 25 }}
                    >
                      <Icon icon={eyeFill} sx={{ width: 15, height: 15 }} />
                    </IconButton>
                  </div>
                  <Typography
                    mt={1}
                    color={associateData.balance < 0 && "#F23545"}
                  >
                    {invoiceData && invoiceData.invoiceId ? (
                      verifyBalance(associateData.balance)
                    ) : (
                      <Skeleton variant="rect" width={300} height={24} />
                    )}
                  </Typography>
                </Stack>
              </Stack>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                  justifyContent: "space-between",
                }}
              >
                <Stack ml={4} alignItems="center">
                  <Typography style={{ fontWeight: "bold" }}>
                    Iniciada por
                  </Typography>
                  {invoiceData && invoiceData.invoiceId ? (
                    <div>
                      <Typography mt={1} textAlign="center">
                        {invoiceData.sellerName}
                      </Typography>
                      <Typography mt={1} textAlign="center">
                        {getDateLocalized(
                          new Date(invoiceData?.createdAt),
                          "dd/MM/yyyy HH:mm"
                        )}
                      </Typography>
                    </div>
                  ) : (
                    <Skeleton variant="rect" width={300} height={24} />
                  )}
                </Stack>
              </Stack>

              {invoiceData && invoiceData.status === 3 && (
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Stack ml={4} alignItems="center">
                    <Typography style={{ fontWeight: "bold" }}>
                      Finalizada por
                    </Typography>
                    {invoiceData && invoiceData.invoiceId ? (
                      <div>
                        <Typography mt={1} textAlign="center">
                          {finisherData.name}
                        </Typography>
                        <Typography mt={1} textAlign="center">
                          {getDateLocalized(
                            new Date(invoiceData?.finishedAt),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </Typography>
                      </div>
                    ) : (
                      <Skeleton variant="rect" width={300} height={24} />
                    )}
                  </Stack>
                </Stack>
              )}

              {invoiceData &&
              invoiceData.paymentDiscount &&
              invoiceData.status === 3 ? (
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Stack ml={4}>
                    <Typography style={{ fontWeight: "bold" }}>
                      Desconto Final
                    </Typography>
                    <Typography mt={1}>
                      {invoiceData && invoiceData.invoiceId ? (
                        formatCurrency(invoiceData.paymentDiscount)
                      ) : (
                        <Skeleton variant="rect" width={300} height={24} />
                      )}
                    </Typography>
                  </Stack>
                </Stack>
              ) : null}

              <Stack sx={{ alignItems: "flex-end" }}>
                <Typography style={{ fontWeight: "bold" }}>Status</Typography>

                {invoiceData && invoiceData.status ? (
                  <StatusWrapper>
                    <StatusTag color={getStatusColor(invoiceData.status)}>
                      {getInvoiceStatus(invoiceData.status)}
                    </StatusTag>
                    {invoiceData && invoiceData.status === 3 && (
                      <PaymentForm>
                        <Typography mt={1} textAlign="center">
                          {getPaymentForm(invoiceData.paymentForm)}
                        </Typography>
                        {getPaymentFormIcon(invoiceData.paymentForm)}
                      </PaymentForm>
                    )}
                  </StatusWrapper>
                ) : (
                  <Skeleton
                    variant="rect"
                    width={120}
                    height={32}
                    style={{ marginTop: 8, borderRadius: 8 }}
                  />
                )}
              </Stack>
            </Stack>

            <CommandInvoiceList
              consumablesItems={invoiceItems}
              addItem={() => setOpenedDialog(true)}
              editItem={(item) => {
                setEditItem(item);
                setOpenedDialog(true);
              }}
              removeCommandItem={onRemoveCommandItem}
              commandStatus={invoiceData.status}
              invoiceData={invoiceData}
              isLoading={isLoadingItems}
            />

            {/*
              Use with -----> setInvoiceItems(groupBy(invoiceItems, "productId"));
              <CommandInvoiceListGrouped
                consumablesItems={invoiceItems}
                addItem={() => setOpenedDialog(true)}
                removeCommandItem={() => setIsOpenDeleteDialog(true)}
                commandStatus={invoiceData.status}
                isLoading={isLoadingItems}
              />
            */}

            <Grid container p={2} justifyContent="flex-end" alignItems="center">
              <Grid item sm={2} xs={12} mr={10} style={{ display: "flex" }}>
                <Typography
                  variant="subtitle1"
                  style={{
                    textAlign: "center",
                    marginRight: 12,
                    color: "#009BFF",
                  }}
                >
                  {invoiceData && invoiceData.invoiceId ? (
                    "Subtotal " +
                    formatCurrency(
                      invoiceData.total === 0
                        ? 0
                        : invoiceData.total + itemsDiscount
                    )
                  ) : (
                    <div style={{ display: "flex", marginLeft: -120 }}>
                      <Skeleton
                        variant="rect"
                        width={78}
                        height={48}
                        style={{ borderRadius: 8, marginRight: 12 }}
                      />
                      <Skeleton
                        variant="rect"
                        width={86}
                        height={48}
                        style={{ borderRadius: 8, marginRight: 12 }}
                      />
                      <Skeleton
                        variant="rect"
                        width={60}
                        height={48}
                        style={{ borderRadius: 8, marginRight: 12 }}
                      />
                      <Skeleton
                        variant="rect"
                        width={118}
                        height={48}
                        style={{ borderRadius: 8, marginRight: 12 }}
                      />
                    </div>
                  )}
                </Typography>

                <Typography
                  variant="subtitle1"
                  style={{
                    textAlign: "center",
                    marginRight: 12,
                    color: "#fa7272",
                  }}
                >
                  {invoiceData &&
                    invoiceData.invoiceId &&
                    "Descontos " +
                      formatCurrency(
                        invoiceData.total === 0 ? 0 : itemsDiscount
                      )}
                </Typography>

                <Typography
                  variant="subtitle1"
                  style={{
                    textAlign: "center",
                    marginRight: 12,
                    color: "#4caf50",
                  }}
                >
                  {invoiceData &&
                    invoiceData.invoiceId &&
                    "Total " +
                      formatCurrency(
                        invoiceData.total === 0 ? 0 : invoiceData.total
                      )}
                </Typography>
              </Grid>
              {invoiceData && invoiceData.status === 2 ? (
                <Grid item>
                  <RestrictedButton
                    fullWidth
                    size="large"
                    type="button"
                    loading={isLoading}
                    variant="outlined"
                    onClick={updateInvoice({ status: 1 })}
                    style={{ marginRight: 12 }}
                    requiredAccessLevel={USER_TYPE.MANAGER}
                  >
                    Reabrir
                  </RestrictedButton>
                </Grid>
              ) : null}

              {invoiceData &&
              invoiceData.status !== undefined &&
              invoiceData.status === 3 ? (
                <Grid item style={{ marginRight: 12 }}>
                  <RestrictedButton
                    fullWidth
                    size="large"
                    type="button"
                    loading={isLoadingReopen}
                    requiredAccessLevel={USER_TYPE.MANAGER}
                    onClick={onReopenInvoice}
                    style={{ marginLeft: 12 }}
                    variant="outlined"
                  >
                    Reabrir
                  </RestrictedButton>
                </Grid>
              ) : null}

              {invoiceData && invoiceData.status === 3 ? (
                <Grid item style={{ marginLeft: 12 }}>
                  <LoadingButton
                    fullWidth
                    size="large"
                    type="button"
                    variant="contained"
                    target="_blank"
                    loading={isLoadingPrint}
                    onClick={print(invoiceData.id)}
                    style={{ marginRight: 12 }}
                  >
                    Imprimir
                  </LoadingButton>
                </Grid>
              ) : null}

              {invoiceData &&
              invoiceData.status !== undefined &&
              invoiceData.status !== 3 ? (
                <Grid item style={{ marginRight: 12 }}>
                  <LoadingButton
                    fullWidth
                    size="large"
                    type="button"
                    loading={isLoading}
                    variant="contained"
                    onClick={onFinishInvoice}
                    style={{ marginLeft: 12 }}
                  >
                    {invoiceData.status === 2 ? "Pagamento" : "Finalizar"}
                  </LoadingButton>
                </Grid>
              ) : null}
            </Grid>
            <Confirm
              onConfirm={handleSimpleFinish}
              open={openedSimpleInvoiceFinish}
              isLoading={isLoadingSimpleFinish}
              title="Finalizar Comanda"
              onCancel={() => setOpenedSimpleInvoiceFinish(false)}
              description={`Você tem certeza que deseja finalizar a comanda ${invoiceData.invoiceId}?`}
            />
            <Confirm
              onConfirm={handleDeleteItem}
              open={isOpenDeleteDialog}
              isLoading={isLoadingDelete}
              title={`Excluir ${currentDeleteItem.productTitle}`}
              onCancel={() => setIsOpenDeleteDialog(false)}
              description={`Você tem certeza que deseja excluir o item ${currentDeleteItem.productTitle} vendido por ${currentDeleteItem.sellerName}?`}
            />
            <DialogAnimate
              widthMax={900}
              open={openedDialog}
              bgcolor={"transparent"}
              boxShadow={"none"}
              onClose={() => {
                setEditItem(undefined);
                setOpenedDialog(false);
              }}
            >
              <TabContext value={formTab}>
                <Box sx={{ backgroundColor: "transparent", pl: 5 }}>
                  <TabList
                    onChange={(event, newValue) => setFormTab(newValue)}
                    TabIndicatorProps={{
                      style: {
                        display: "none",
                      },
                    }}
                  >
                    <TabItem label="Clube" value="1" />
                    {!editItem && <TabItem label="Associado" value="2" />}
                  </TabList>
                </Box>
                <TabPanel value="1">
                  <AddConsumption
                    saveConsumptionAdd={() => {}}
                    handleClose={() => {
                      setEditItem(undefined);
                      setOpenedDialog(false);
                    }}
                    currentConsumption={editItem}
                    cancelConsumptionAdd={() => {
                      setEditItem(undefined);
                      setOpenedDialog(false);
                    }}
                    associateId={associateData.id}
                    invoiceId={invoiceData.id}
                  />
                </TabPanel>
                {!editItem && (
                  <TabPanel value="2">
                    <AddConsumptionAssociated
                      saveConsumptionAdd={() => {}}
                      handleClose={() => {
                        setEditItem(undefined);
                        setOpenedDialog(false);
                        setFormTab("1");
                      }}
                      cancelConsumptionAdd={() => {
                        setEditItem(undefined);
                        setOpenedDialog(false);
                      }}
                      associateId={associateData.id}
                      invoiceId={invoiceData.id}
                    />
                  </TabPanel>
                )}
              </TabContext>
            </DialogAnimate>
            {/* <DialogAnimate
              widthMax={800}
              open={openedDialogAmmoCheck}
              onClose={() => {
                setOpenedDialogAmmoCheck(false);
                setAmmoCheckList([]);
              }}
            >
              <AmmoCheck
                ammunitionsList={ammoCheckList}
                handleClose={() => setOpenedDialogAmmoCheck(false)}
                invoiceId={invoiceData.id}
              />
            </DialogAnimate> */}

            <DialogAnimate
              widthMax={730}
              open={modalBalance}
              bgcolor={"transparent"}
              boxShadow="none"
              onClose={() => {
                setModalBalance(false);
              }}
            >
              <Card sx={{ p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <p>
                    O saldo atual do {"\n"}
                    {verifyTypeUser(associateData.internalUserType)} {"\n"}
                    <AssociateNameTag>
                      {associateData.name}
                    </AssociateNameTag>{" "}
                    {"\n"} é de {"\n"}
                    <ValueBalanceTag balanceValue={associateData.balance}>
                      {formatCurrency(associateData.balance)}
                    </ValueBalanceTag>
                    . <br />
                    Caso a comanda seja finalizada com o valor da carteira, o
                    saldo ficará em {"\n"}
                    <ValueBalanceTag
                      balanceValue={associateData.balance - invoiceData?.total}
                    >
                      {formatCurrency(
                        associateData.balance - invoiceData?.total
                      )}
                    </ValueBalanceTag>
                    .
                  </p>
                </Box>
              </Card>
            </DialogAnimate>

            <DialogAnimate
              open={openCommandFinalize}
              onClose={() => setOpenCommandFinalize(false)}
              widthMax={600}
            >
              <CommandFinalize
                handleClose={() => setOpenCommandFinalize(false)}
                widthMax={600}
                invoiceData={invoiceData}
                associateData={associateData}
                invoiceItems={invoiceItems}
              />
            </DialogAnimate>
          </Card>
        </Container>
      </Page>
    </DashboardLayout>
  );
};

CommandInvoice.propTypes = {};

export const getServerSideProps = withAuthLevel();

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(CommandInvoice);
