import { Icon } from "@iconify/react";
import googleFill from "@iconify/icons-eva/google-fill";
import twitterFill from "@iconify/icons-eva/twitter-fill";
import facebookFill from "@iconify/icons-eva/facebook-fill";
import linkedinFill from "@iconify/icons-eva/linkedin-fill";
import { experimentalStyled as styled } from "@material-ui/core/styles";
import { Link, Divider, Container, Typography } from "@material-ui/core";

const RootStyle = styled("div")(({ theme }) => ({
  position: "relative",
  backgroundColor: theme.palette.background.default,
}));

// ----------------------------------------------------------------------

export default function MainFooter() {
  return (
    <RootStyle>
      <Divider />
      <Container
        maxWidth="lg"
        sx={{
          justifyContent: "center",
          display: "flex",
          marginLeft: "270px",
          padding: "12px 0"
        }}
      >
        <Typography variant="caption" component="p">
          © {new Date().getFullYear()} Todos os direitos reservados &nbsp;
          <Link href="https://www.gunfight.com.br/" target="_blank">
            GUNFIGHT
          </Link>
        </Typography>
      </Container>
    </RootStyle>
  );
}
