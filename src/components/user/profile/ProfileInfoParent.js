import { useCallback, useEffect, useState } from "react";
import { Profile } from "src/components/user/profile";
import { experimentalStyled as styled } from "@material-ui/core/styles";
import { Tab, Box, Card, Tabs, Container, Typography } from "@material-ui/core";
import { useAuthUser } from "next-firebase-auth";
import { useRouter } from "next/router";
import { getAbsoluteUrl } from "src/utils/auth";
import dynamic from "next/dynamic";
import { formatCurrency } from "src/utils/string";
import { dispatchEvent } from "src/utils/events";
import UploadAvatar from "src/components/UploadAvatar";
import { formatPhone } from "src/utils/string";

const Page = dynamic(() => import("src/components/Page"), { ssr: false });
const DashboardLayout = dynamic(() => import("src/layouts/dashboard"), {
  ssr: false,
});
const FireArms = dynamic(() => import("src/components/user/UserFireArms"), {
  ssr: false,
});
const UserAddress = dynamic(() => import("src/components/user/UserAddress"), {
  ssr: false,
});
const UserDocuments = dynamic(
  () => import("src/components/user/UserDocuments"),
  { ssr: false }
);
const UserHistory = dynamic(() => import("src/components/user/UserHistory"), {
  ssr: false,
});
const UserWallet = dynamic(() => import("src/components/user/UserWallet"), {
  ssr: false,
});
const SvgIconStyle = dynamic(() => import("src/components/SvgIconStyle"), {
  ssr: false,
});

const TabsWrapperStyle = styled("div")(({ theme }) => ({
  display: "flex",
  height: "100%",
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up("sm")]: {
    justifyContent: "center",
  },
  [theme.breakpoints.up("md")]: {
    justifyContent: "space-between",
    paddingRight: theme.spacing(3),
  },
}));

const BalanceWrapper = styled("div")(() => ({
  flex: "1",
  marginTop: 8,
}));

const BalanceTag = styled("div")(({ color }) => ({
  display: "inline-flex",
  borderRadius: 8,
  padding: "3px 12px",
  minWidth: 115,
  justifyContent: "center",
  alignItems: "center",
  height: 32,
  color: "#fff",
  backgroundColor: color,
}));

const DivTags = styled("div")(({ theme }) => ({
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  "&:not(:first-child)": {
    marginLeft: 10,
  }
}));
const PersonalTag = styled("div")(({ theme }) => ({
  borderRadius: 8,
  display: "inline-flex",
  padding: "3px 12px",
  minWidth: 45,
  justifyContent: "center",
  alignItems: "center",
  color: "#fff",
  backgroundColor: theme.palette.success.dark,
}));
const AmmunitionTag = styled("div")(({ theme }) => ({
  borderRadius: 8,
  padding: "3px 12px",
  minWidth: 45,
  justifyContent: "center",
  alignItems: "center",
  color: "#fff",
  backgroundColor: theme.palette.warning.darker,
}));

const InfoStyle = styled("div")(({ theme }) => ({

  flexDirection: "column",
  marginTop: theme.spacing(5),
  [theme.breakpoints.up("md")]: {
    right: "auto",
    display: "flex",
    alignItems: "center",
    left: theme.spacing(3),
    top: theme.spacing(5),
  },
}));


export default function ProfileInfoParent({ currentUser, initialTab }) {
  const AuthUser = useAuthUser();
  const router = useRouter();
  const { id, isNew } = router.query;
  const isNewAssociate = isNew === "true";

  const [currentTab, setCurrentTab] = useState(initialTab);
  const [currentUserLocal, setCurrentUserLocal] = useState(currentUser);

  const [filePreview, setFilePreview] = useState(
    currentUser?.profilePhoto
      ? currentUser?.profilePhoto
      : "/static/mock-images/avatars/avatar.jpg"
  );

  const handleDropSingleFile = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFilePreview(URL.createObjectURL(file));

      if (onSelectAvatar) {
        onSelectAvatar(file);
      }
    }
  }, []);

  const getBalanceColor = (balanceValue) => {
    const isPositive = Math.sign(balanceValue) >= 0;
    return isPositive ? "#01579b" : "#b71c1c";
  };

  useEffect(() => {
    const handler = async () => {
      const token = await AuthUser.getIdToken();
      const response = await fetch(`/api/associate/data?id=${id}`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });
      const data = await response.json();
      setCurrentUserLocal(data);
    };

    document.addEventListener("CurrentUser.reload", handler);

    return () => {
      document.removeEventListener("CurrentUser.reload", handler);
    };
  }, []);

  const handleChangeTab = (_, newValue) => {
    setCurrentTab(newValue);

    const path = getTabPath(newValue);
    const pathname = window.location.pathname
      .substring(0, window.location.pathname.lastIndexOf("/"))
      .replace(`/${id}`, "");

    window.history.replaceState(
      null,
      null,
      `${pathname}${id.indexOf("/") > -1 ? id : `/${id}`}${path}`
    );
  };

  const getIcon = (name) => (
    <SvgIconStyle src={`/static/icons/navbar/${name}.svg`} />
  );

  const getTabPath = (tabName) => {
    const tabPaths = [
      { name: "Dados", path: "" },
      { name: "Carteira", path: "/wallet" },
      { name: "Endereços", path: "/addresses" },
      { name: "Documentos", path: "/documents" },
      { name: "Armas", path: "/weapons" },
      { name: "Histórico", path: "/history" },
    ];

    const tab = tabPaths.find((item) => item.name === tabName);
    return tab.path;
  };

  const ICONS = {
    data: getIcon("ic_data"),
    wallet: getIcon("ic_wallet"),
    address: getIcon("ic_address"),
    file: getIcon("ic_file"),
    fireWeapon: getIcon("ic_fire-weapon"),
    history: getIcon("ic_history"),
  };

  const PROFILE_TABS = [
    {
      value: "Dados",
      icon: ICONS.data,
      component: Profile,
    },
    {
      value: "Carteira",
      icon: ICONS.wallet,
      component: UserWallet,
      disabled: isNewAssociate,
    },
    {
      value: "Endereços",
      icon: ICONS.address,
      component: UserAddress,
      disabled: isNewAssociate,
    },
    {
      value: "Documentos",
      icon: ICONS.file,
      component: UserDocuments,
      disabled: isNewAssociate,
    },
    {
      value: "Armas",
      icon: ICONS.fireWeapon,
      component: FireArms,
      disabled: isNewAssociate,
    },
    {
      value: "Histórico",
      icon: ICONS.history,
      component: UserHistory, //UserContactHistory,
      disabled: isNewAssociate,
    },
  ];

  const handleAvatarSelection = (file) => {
    dispatchEvent("CurrentUser.updateProfilePhoto", {
      file,
    });
  };

  return (
    <DashboardLayout>
      <Page
        title={`${currentUser && currentUser.name ? `${currentUser.name} - ` : "Novo"
          } Associado`}
      >
        <Container maxWidth="xl">
          <div style={{ flexDirection: "row", display: "flex", justifyContent: 'space-between' }}>
            <Card
              sx={{
                mb: 3,
                height: 100,
                paddingLeft: 2,
                paddingRight: 2,
                minWidth: '38%',
                maxWidht: '38%',
              }}
            >
              <div style={{ flexDirection: "row", display: "flex", alignItems: "center" }}>
                <UploadAvatar
                  accept="image/*"
                  maxSize={3145728}
                  file={filePreview}
                  onDrop={handleDropSingleFile}
                />
                <Box
                  sx={{
                    ml: { md: 3 },
                    mt: { xs: 1, md: 0 },
                    color: "common.white",
                    textAlign: { xs: "center", md: "left" },
                  }}
                >
                  <Typography variant="h5" color="#F23545">
                    {id === "new" ? "Novo Associado" : currentUser?.name}
                  </Typography>
                  <div style={{ flexDirection: 'row' }}>
                    {currentUserLocal.balance !== undefined ? (
                      <BalanceWrapper>
                        <DivTags>
                          {/* <Typography variant="h8" color="#fff">Carteira</Typography> */}
                          <BalanceTag
                            color={getBalanceColor(currentUserLocal.balance)}
                          >
                            Carteira: {formatCurrency(currentUserLocal.balance)}
                          </BalanceTag>
                        </DivTags>
                        <DivTags>
                          {/* <Typography variant="h8" color="#fff">Aulas Personal</Typography> */}
                          <PersonalTag>
                            Aulas de Personal: {currentUserLocal.personalClasses ?? "N/A"}
                          </PersonalTag>
                        </DivTags>

                      </BalanceWrapper>
                    ) : (
                      <div />
                    )}
                  </div>
                </Box>

              </div>
            </Card>

            <Card
              sx={{
                mb: 3,
                height: 100,
              }}
            >
              <TabsWrapperStyle>
                <Tabs
                  value={currentTab}
                  scrollButtons="auto"
                  variant="scrollable"
                  allowScrollButtonsMobile
                  onChange={handleChangeTab}
                  style={{ height: 75, marginLeft: 25 }}
                >
                  {PROFILE_TABS.map((tab) => (
                    <Tab
                      style={{ height: 62, paddingTop: 8 }}
                      disableRipple
                      key={tab.value}
                      icon={tab.icon}
                      label={tab.value}
                      value={tab.value}
                      disabled={tab.disabled}
                    />
                  ))}
                </Tabs>
              </TabsWrapperStyle>
            </Card>
          </div>

          {PROFILE_TABS.map((tab) => {
            const isMatched = tab.value === currentTab;
            return (
              isMatched && (
                <Box key={tab.value}>
                  <tab.component currentUser={currentUserLocal} userId={id} />
                </Box>
              )
            );
          })}
        </Container>
      </Page>
    </DashboardLayout>
  );
}

export const handleProfileData = async (req, data, token) => {
  const id = req.params.id;
  let currentUser = null;

  if (id !== "new") {
    const response = await fetch(
      getAbsoluteUrl(`/api/associate/data?id=${id}`),
      {
        method: "GET",
        headers: {
          Authorization: token,
        },
      }
    );

    const data = await response.json();
    currentUser = data;
  }

  const initialProps = {
    ...data,
  };

  if (currentUser) {
    initialProps.currentUser = currentUser;
  }

  return {
    props: {
      ...initialProps,
    },
  };
};
