import PropTypes from "prop-types";
import {
  Box,
  Stack,
  Button,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@material-ui/core";
import { DialogAnimate } from "src/components/animate";
import { CONTACT_HISTORY_CHANNEL, CONTACT_HISTORY_REASONS, getEnumTitle } from "src/utils/enums";
import { getDateLocalized } from "src/utils/localizedDateFns";

const ViewContact = ({
  open,
  onClose,
  data
}) => {
  if (!data.date) {
    return null;
  }

  return (
    <DialogAnimate open={open} onClose={onClose} widthMax={600}>
      <DialogTitle>Histórico de Contato</DialogTitle>
      <DialogContent>
        <Stack
          mt={4}
          spacing={{ xs: 3, sm: 15 }}
          direction={{ xs: "column", sm: "row" }}
        >
          <Box>
            <Typography variant="subtitle2">Data</Typography>
            <DialogContentText>{getDateLocalized(new Date(data.date), "dd/MM/yyyy")}</DialogContentText>
          </Box>
          <Box>
            <Typography variant="subtitle2">Canal</Typography>
            <DialogContentText>{getEnumTitle(CONTACT_HISTORY_CHANNEL, data.channel)}</DialogContentText>
          </Box>
          <Box>
            <Typography variant="subtitle2">Motivo</Typography>
            <DialogContentText>{getEnumTitle(CONTACT_HISTORY_REASONS, data.reason)}</DialogContentText>
          </Box>
        </Stack>
        <Box>
          <Typography variant="subtitle2">Contatado por</Typography>
          <DialogContentText>{data.sellerName}</DialogContentText>
        </Box>
        <Box mt={3}>
          <Typography variant="subtitle2">Descrição</Typography>
          <DialogContentText>{data.description}</DialogContentText>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus>
          Fechar
        </Button>
      </DialogActions>
    </DialogAnimate>
  );
};

ViewContact.propTypes = {
  onClose: PropTypes.func,
  data: PropTypes.string,
  channel: PropTypes.string,
  reason: PropTypes.string,
  observations: PropTypes.string,
  open: PropTypes.bool.isRequired,
};

export default ViewContact;
