import { Icon } from "@iconify/react";
import { useRef, useState } from "react";
import personFill from "@iconify/icons-eva/person-fill";
// next
import NextLink from "src/components/Button/Link";
import { useRouter } from "next/router";

// material
import { alpha } from "@material-ui/core/styles";
import {
  Box,
  Avatar,
  Button,
  Divider,
  MenuItem,
  Typography,
} from "@material-ui/core";
// components
import MenuPopover from "../../components/MenuPopover";
import { MIconButton } from "../../components/@material-extend";

import firebase from "firebase/app";
import { USER_TYPE_DESCRIPTION } from "src/utils/auth";
import { dispatchEvent } from "src/utils/events";
import { useSelector } from "react-redux";
// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  /*{
    label: "Menu",
    icon: homeFill,
    linkTo: "/dashboard/statements",
  },
  {
    label: "Minha Conta",
    icon: personFill,
    linkTo: "/dashboard/app/my_account",
  },
  {
    label: "Configurações",
    icon: settings2Fill,
    linkTo: "/dashboard/app/admin",
  },*/
  {
    label: "Minha Conta",
    icon: personFill,
    linkTo: "/internal/users?id=${id}",
    onClick: () => {
      dispatchEvent("Navigation.editUser");
    },
  },
];

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const userInfo = useSelector((state) => state.user.userInfo);
  const anchorRef = useRef(null);
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = (option) => {
    setOpen(false);

    if (option && option.onClick) {
      option.onClick();
    }
  };

  const signOut = () => {
    return firebase
      .auth()
      .signOut()
      .then(
        function () {
          console.log("Signed Out");
          router.replace("/");
        },
        function (error) {
          console.error("Sign Out Error", error);
        }
      );
  };

  return (
    <>
      <MIconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          padding: 0,
          width: 48,
          height: 48,
          marginTop: 0.5,
          ...(open && {
            "&:before": {
              zIndex: 1,
              content: "''",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              position: "absolute",
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
            },
          }),
        }}
      >
        <Avatar
          alt={`Imagem de ${userInfo?.name}`}
          src={
            userInfo && userInfo.userPhoto
              ? userInfo.userPhoto
              : "/static/mock-images/avatars/avatar_default.jpg"
          }
        />
      </MIconButton>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        sx={{ width: 220 }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle1" noWrap>
            {userInfo ? userInfo.name : ""}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
            {userInfo ? USER_TYPE_DESCRIPTION[userInfo.accessLevel] : ""}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        {MENU_OPTIONS.map((option) => (
          <NextLink
            key={option.label}
            href={option.linkTo.replace("${id}", userInfo?.id)}
          >
            <MenuItem
              onClick={() => handleClose(option)}
              sx={{ typography: "body2", py: 1, px: 2.5 }}
            >
              <Box
                component={Icon}
                icon={option.icon}
                sx={{
                  mr: 2,
                  width: 24,
                  height: 24,
                }}
              />

              {option.label}
            </MenuItem>
          </NextLink>
        ))}

        <Box sx={{ p: 2, pt: 1.5 }}>
          <Button
            fullWidth
            color="inherit"
            variant="outlined"
            onClick={signOut}
          >
            Sair
          </Button>
        </Box>
      </MenuPopover>
    </>
  );
}
