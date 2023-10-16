import React from "react";
import PropTypes from "prop-types";
import { LoadingButton } from "@material-ui/lab";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@material-ui/core";

const Confirm = ({
  open,
  onCancel,
  isLoading,
  onConfirm,
  description,
  maxWidth = "xs",
  cancelText = "Não",
  confirmText = "Sim",
  title = "Confirmar",
}) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth={maxWidth}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ mt: 1 }}>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ mt: -2 }}>
        <LoadingButton onClick={onCancel} color="primary" disabled={isLoading}>
          {cancelText}
        </LoadingButton>
        <LoadingButton
          onClick={onConfirm}
          color="primary"
          autoFocus
          loading={isLoading}
          variant="contained"
        >
          {confirmText}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

Confirm.propTypes = {
  title: PropTypes.string,
  maxWidth: PropTypes.string,
  cancelText: PropTypes.string,
  confirmText: PropTypes.string,
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  description: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
};

export default Confirm;
