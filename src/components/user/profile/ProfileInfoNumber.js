import { fNumber } from "src/utils/formatNumber";
import { Card, Stack, Typography, Divider } from "@material-ui/core";

export default function ProfileInfoNumber() {
  return (
    <Card sx={{ py: 3 }}>
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
      >
        <Stack width={1} textAlign="center">
          <Typography variant="h4">{fNumber(11231)}</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Tiros Disparados
          </Typography>
        </Stack>

        <Stack width={1} textAlign="center">
          <Typography variant="h4">{fNumber(24)}</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Treinamentos Efetuados
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
