import { useEffect } from "react";
import PropTypes from "prop-types";
// next
import NextLink from "src/components/Button/Link";
import { useRouter } from "next/router";
// material
import { Avatar, Box, Drawer, Link, Typography } from "@material-ui/core";
import { experimentalStyled as styled } from "@material-ui/core/styles";
// components
import Scrollbar from "../../components/Scrollbar";
import NavSection from "../../components/NavSection";
//
import LogoText from "../../components/LogoText";
import { MHidden } from "../../components/@material-extend";

import { useSelector } from "react-redux";
import AccountPopover from "./AccountPopover";
import { USER_TYPE_DESCRIPTION } from "src/utils/auth";

// ----------------------------------------------------------------------

const DRAWER_WIDTH = 270;

const RootStyle = styled("div")(({ theme }) => ({
  [theme.breakpoints.up("lg")]: {
    flexShrink: 0,
    minWidth: DRAWER_WIDTH,
  },
}));

const AccountStyle = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2, 2.5),
  borderRadius: theme.shape.borderRadiusSm,
  backgroundColor: theme.palette.grey[500_12],
}));

// ----------------------------------------------------------------------

DashboardSidebar.propTypes = {
  isOpenSidebar: PropTypes.bool,
  onCloseSidebar: PropTypes.func,
};

export default function DashboardSidebar({ isOpenSidebar, onCloseSidebar }) {
  const { pathname } = useRouter();
  const userInfo = useSelector((state) => state.user.userInfo);

  useEffect(() => {
    if (isOpenSidebar) {
      onCloseSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: "100%",
        "& .simplebar-content": {
          height: "100%",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box sx={{ px: 2.5, py: 3 }}>
        <NextLink href="/home">
          <Box sx={{ display: "inline-flex" }}>
            <LogoText />
          </Box>
        </NextLink>
      </Box>

      <Box sx={{ mb: 2, mx: 2.5 }}>
        <>
          <AccountStyle>
            <AccountPopover />
            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle2" sx={{ color: "text.primary" }}>
                {userInfo ? userInfo.name : ""}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {userInfo ? USER_TYPE_DESCRIPTION[userInfo.accessLevel] : ""}
              </Typography>
            </Box>
          </AccountStyle>
        </>
      </Box>

      <NavSection />

      <Box sx={{ mb: 2, mx: 2.5 }}>
        <p style={{ fontSize: 14 }}>
          Desenvolvido por{" "}
          <Link href="https://www.gunfight.com.br/" target="_blank">
            GUNFIGHT
          </Link>
        </p>
      </Box>
    </Scrollbar>
  );

  return (
    <RootStyle>
      <MHidden width="lgUp">
        <Drawer
          open={isOpenSidebar}
          onClose={onCloseSidebar}
          PaperProps={{
            sx: { width: DRAWER_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      </MHidden>

      <MHidden width="lgDown">
        <Drawer
          open
          variant="persistent"
          PaperProps={{
            sx: { width: DRAWER_WIDTH, bgcolor: "background.default" },
          }}
        >
          {renderContent}
        </Drawer>
      </MHidden>
    </RootStyle>
  );
}
