import { motion } from "framer-motion";
// next
import NextLink from "src/components/Button/Link";
// material
import { experimentalStyled as styled } from "@material-ui/core/styles";
import { Box, Button, Typography, Container } from "@material-ui/core";
// layouts
import LogoOnlyLayout from "src/layouts/LogoOnlyLayout";
// components
import { MotionContainer, varBounceIn } from "src/components/animate";
import Page from "src/components/Page";
import { PageNotFoundIllustration } from "src/assets";
import { AuthAction, withAuthUser } from "next-firebase-auth";

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  display: "flex",
  minHeight: "100%",
  alignItems: "center",
  paddingTop: theme.spacing(15),
  paddingBottom: theme.spacing(10),
}));

// ----------------------------------------------------------------------

function AccessDenied() {
  return (
    <LogoOnlyLayout>
      <RootStyle title="403">
        <Container>
          <MotionContainer initial="initial" open>
            <Box sx={{ maxWidth: 480, margin: "auto", textAlign: "center" }}>
              <motion.div variants={varBounceIn}>
                <Typography variant="h3" paragraph>
                  Desculpe, acesso proibido! OPS!
                </Typography>
              </motion.div>
              <Typography sx={{ color: "text.secondary" }}>
                Você está tentando acessar uma página na qual não tem permissão
                de acesso.
              </Typography>

              <motion.div variants={varBounceIn}>
                <PageNotFoundIllustration
                  sx={{ height: 260, my: { xs: 5, sm: 10 } }}
                />
              </motion.div>

              <NextLink href="/">
                <Button size="large" variant="contained">
                  Voltar ao menu
                </Button>
              </NextLink>
            </Box>
          </MotionContainer>
        </Container>
      </RootStyle>
    </LogoOnlyLayout>
  );
}

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(AccessDenied);
