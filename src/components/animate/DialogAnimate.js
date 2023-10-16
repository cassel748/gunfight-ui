import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
// material
import { Dialog } from "@material-ui/core";
//
import { varFadeInUp } from "./variants";

// ----------------------------------------------------------------------

DialogAnimate.propTypes = {
  open: PropTypes.bool.isRequired,
  animate: PropTypes.object,
  onClose: PropTypes.func,
  widthMax: PropTypes.number,
  children: PropTypes.node.isRequired,
};

export default function DialogAnimate({
  open = false,
  animate,
  onClose,
  widthMax,
  children,
  bgcolor,
  boxShadow,
  ...other
}) {
  return (
    <AnimatePresence>
      {open && (
        <Dialog
          fullWidth
          maxWidth="xs"
          open={open}
          onClose={onClose}
          PaperComponent={motion.div}
          PaperProps={{
            sx: {
              borderRadius: 2,
              bgcolor: bgcolor || "background.paper",
              maxWidth: widthMax,
              boxShadow: boxShadow
            },
            ...(animate || varFadeInUp),
          }}
          {...other}
        >
          {children}
        </Dialog>
      )}
    </AnimatePresence>
  );
}
