import PropTypes from "prop-types";
import { useState } from "react";
// material
import { experimentalStyled as styled } from "@material-ui/core/styles";
//
import DashboardNavbar from "./DashboardNavbar";
import DashboardSidebar from "./DashboardSidebar";
import useSettings from "src/hooks/useSettings";
import MainFooter from "../main/MainFooter";

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 30;

const RootStyle = styled("div")({
  display: "flex",
  minHeight: "100%",
  overflow: "hidden",
});

const MainStyle = styled("div")(({ theme, mode }) => ({
  flexGrow: 1,
  overflow: "auto",
  minHeight: "100%",
  minHeight: "100vh",
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  backgroundColor: mode === "light" ? "#fff" : theme.palette.primary.background,
  [theme.breakpoints.up("lg")]: {
    paddingTop: APP_BAR_DESKTOP,
  },
}));

// ----------------------------------------------------------------------

DashboardLayout.propTypes = {
  children: PropTypes.node,
};

export default function DashboardLayout({ children }) {
  const [open, setOpen] = useState(false);
  const { themeMode } = useSettings();

  return (
    <>
      <RootStyle>
        <DashboardNavbar onOpenSidebar={() => setOpen(true)} />
        <DashboardSidebar
          isOpenSidebar={open}
          onCloseSidebar={() => setOpen(false)}
        />

        <MainStyle mode={themeMode}>{children}</MainStyle>
      </RootStyle>
      <MainFooter />
    </>
  );
}
