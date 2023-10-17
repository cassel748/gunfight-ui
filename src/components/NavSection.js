import { useState, forwardRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import arrowIosForwardFill from "@iconify/icons-eva/arrow-ios-forward-fill";
import arrowIosDownwardFill from "@iconify/icons-eva/arrow-ios-downward-fill";
// next
import NextLink from "src/components/Button/Link";
import { useRouter } from "next/router";
// material
import {
  alpha,
  useTheme,
  experimentalStyled as styled,
} from "@material-ui/core/styles";
import {
  Box,
  List,
  ListItem,
  Collapse,
  ListItemText,
  ListItemIcon,
  ListSubheader,
} from "@material-ui/core";
import useMenu from "src/hooks/useMenu";
import SvgIconStyle from "./SvgIconStyle";
import { useSelector } from "react-redux";
import { USER_TYPE } from "src/utils/auth";

// ----------------------------------------------------------------------

const ListSubheaderStyle = styled((props) => (
  <ListSubheader disableSticky disableGutters {...props} />
))(({ theme }) => ({
  ...theme.typography.overline,
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  paddingLeft: theme.spacing(5),
  color: theme.palette.text.primary,
}));

const ListItemStyle = styled((props) => (
  <ListItem button disableGutters {...props} />
))(({ theme }) => ({
  ...theme.typography.body2,
  height: 48,
  position: "relative",
  textTransform: "capitalize",
  paddingLeft: theme.spacing(5),
  paddingRight: theme.spacing(2.5),
  color: theme.palette.text.secondary,
  "&:before": {
    top: 0,
    right: 0,
    width: 3,
    bottom: 0,
    content: "''",
    display: "none",
    position: "absolute",
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    backgroundColor: theme.palette.primary.main,
  },
}));

const ListItemIconStyle = styled(ListItemIcon)({
  width: 22,
  height: 22,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const NextLinkStyle = styled(NextLink)({
  textDecoration: "none"
});

// ----------------------------------------------------------------------

NavItem.propTypes = {
  item: PropTypes.object,
  active: PropTypes.func,
};

const Item = forwardRef(({ children, ...other }, ref) => {
  return <ListItemStyle {...other}>{children}</ListItemStyle>;
});

function NavItem({ item, active }) {
  const theme = useTheme();
  const isActiveRoot = active(item.path);
  const { title, path, icon, info, children } = item;
  const [open, setOpen] = useState(isActiveRoot);

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const activeRootStyle = {
    color: "primary.main",
    fontWeight: "fontWeightMedium",
    bgcolor: alpha(
      theme.palette.primary.main,
      theme.palette.action.selectedOpacity
    ),
    "&:before": { display: "block" },
  };

  const activeSubStyle = {
    color: "text.primary",
    fontWeight: "fontWeightMedium",
  };

  if (children) {
    return (
      <div style={{ textDecoration: "none" }}>
        <Item
          onClick={handleOpen}
          sx={{
            ...(isActiveRoot && activeRootStyle),
          }}
        >
          <ListItemIconStyle>{icon && icon}</ListItemIconStyle>
          <ListItemText disableTypography primary={title} />
          {info && info}
          <Box
            component={Icon}
            icon={open ? arrowIosDownwardFill : arrowIosForwardFill}
            sx={{ width: 16, height: 16, ml: 1 }}
          />
        </Item>

        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {children.map((item, index) => {
              const isActiveSub = active(item.path);

              return (
                <NextLinkStyle key={index} href={item.path}>
                  <Item
                    sx={{
                      ...(isActiveSub && activeSubStyle),
                    }}
                  >
                    <ListItemIconStyle>
                      <Box
                        component="span"
                        sx={{
                          width: 4,
                          height: 4,
                          display: "flex",
                          borderRadius: "50%",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "text.disabled",
                          transition: (theme) =>
                            theme.transitions.create("transform"),
                          ...(isActiveSub && {
                            transform: "scale(2)",
                            bgcolor: "primary.main",
                          }),
                        }}
                      />
                    </ListItemIconStyle>
                    <ListItemText disableTypography primary={item.title} />
                  </Item>
                </NextLinkStyle>
              );
            })}
          </List>
        </Collapse>
      </div>
    );
  }

  const getIcon = (name) => (
    <SvgIconStyle
      src={`/static/icons/navbar/${name}.svg`}
      sx={{ width: "100%", height: "100%" }}
    />
  );

  return (
    <NextLinkStyle href={path}>
      <Item
        sx={{
          ...(isActiveRoot && activeRootStyle),
        }}
      >
        <ListItemIconStyle>{icon && getIcon(`ic_${icon}`)}</ListItemIconStyle>
        <ListItemText disableTypography primary={item.title} />
        {info && info}
      </Item>
    </NextLinkStyle>
  );
}

NavSection.propTypes = {
  navConfig: PropTypes.array,
};

export default function NavSection({ ...other }) {
  const { pathname } = useRouter();
  const match = (path) => pathname.includes(path);
  const { menuConfig } = useMenu();
  const userInfo = useSelector((state) => state.user.userInfo);

  const filteredMenus = menuConfig.filter((item) => {
    if (userInfo?.accessLevel === USER_TYPE.SUPER || (item.subheader && item.active)) {
      return true;
    }

    if (item.requiredAccessLevel <= userInfo?.accessLevel && item.active) {
      return true;
    }
  });

  return (
    <Box {...other}>
      <List disablePadding>
        {filteredMenus.map((item, index) => {
          if (
            item.subheader &&
            filteredMenus[index + 1] !== undefined &&
            !filteredMenus[index + 1].subheader
          ) {
            return (
              <ListSubheaderStyle key={index}>
                {item.subheader}
              </ListSubheaderStyle>
            );
          }

          if (!item.subheader) {
            return <NavItem key={index} item={item} active={match} />;
          }

          return null;
        })}
      </List>
    </Box>
  );
}
