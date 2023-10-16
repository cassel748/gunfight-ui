import { Icon } from "@iconify/react";
import pinFill from "@iconify/icons-eva/pin-fill";
import emailFill from "@iconify/icons-eva/email-fill";
import { experimentalStyled as styled } from "@material-ui/core/styles";
import roundBusinessCenter from "@iconify/icons-ic/round-business-center";
import { Link, Card, Typography, CardHeader, Stack } from "@material-ui/core";

// ----------------------------------------------------------------------

const IconStyle = styled(Icon)(({ theme }) => ({
  width: 20,
  height: 20,
  marginTop: 1,
  flexShrink: 0,
  marginRight: theme.spacing(2),
}));

// ----------------------------------------------------------------------

export default function ProfileAbout() {
  return (
    <Card>
      <CardHeader title="Sobre" />

      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography variant="body2">
          Atirador amador, armamentista e competidor
        </Typography>

        <Stack direction="row">
          <IconStyle icon={pinFill} />
          <Typography variant="body2">
            Mora no &nbsp;
            <Link component="span" variant="subtitle2" color="text.primary">
              Brasil
            </Link>
          </Typography>
        </Stack>

        <Stack direction="row">
          <IconStyle icon={emailFill} />
          <Typography variant="body2">pedro.daltoe@gunfight.com</Typography>
        </Stack>

        <Stack direction="row">
          <IconStyle icon={roundBusinessCenter} />
          <Typography variant="body2">
            Trabalha na &nbsp;
            <Link component="span" variant="subtitle2" color="text.primary">
              Prefeitura de POA
            </Link>
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
