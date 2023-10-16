import React, { useState } from "react";
import PropTypes from "prop-types";
import { LoadingButton } from "@material-ui/lab";
import eyeFill from "@iconify/icons-eva/eye-fill";
import eyeOffFill from "@iconify/icons-eva/eye-off-fill";
import {
  Icon,
  Dialog,
  TextField,
  IconButton,
  DialogTitle,
  DialogActions,
  InputAdornment,
} from "@material-ui/core";

const PasswordRequired = ({
  open,
  password,
  onCancel,
  onChange,
  isLoading,
  onConfirm,
  maxWidth = "xs",
  cancelText = "Não",
  confirmText = "Sim",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth={maxWidth}>
      <DialogTitle>Digite a senha de administrador para continuar</DialogTitle>
      <TextField
        fullWidth
        label="Senha"
        autoComplete="current-password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={onChange}
        style={{ margin: 20, width: "88%" }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleShowPassword} edge="end">
                <Icon icon={showPassword ? eyeFill : eyeOffFill} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <DialogActions sx={{ mt: -2 }}>
        <LoadingButton onClick={onCancel} color="primary" disabled={isLoading}>
          {cancelText}
        </LoadingButton>
        <LoadingButton
          autoFocus
          color="primary"
          variant="contained"
          onClick={onConfirm}
          loading={isLoading}
        >
          {confirmText}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

PasswordRequired.propTypes = {
  isLoading: PropTypes.bool,
  onChange: PropTypes.func,
  maxWidth: PropTypes.string,
  password: PropTypes.string,
  cancelText: PropTypes.string,
  confirmText: PropTypes.string,
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default PasswordRequired;
