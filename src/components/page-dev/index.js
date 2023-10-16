import { Box, Container, Typography } from "@material-ui/core";
import { SeverErrorIllustration } from "src/assets";
import { MotionContainer, varBounceIn } from "../animate";
import { m } from "framer-motion";

const PageDev = () => {
  return (
    <Container component={MotionContainer}>
      <Box sx={{ maxWidth: 480, margin: "auto", textAlign: "center" }}>
        <m.div variants={varBounceIn}>
          <Typography variant="h3" paragraph>
            Página em desenvolvimento
          </Typography>
        </m.div>
        <Typography sx={{ color: "text.secondary" }}>
          Tente novamente mais tarde
        </Typography>
        <m.div variants={varBounceIn}>
          <SeverErrorIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
        </m.div>
      </Box>
    </Container>
  );
};

export default PageDev;
