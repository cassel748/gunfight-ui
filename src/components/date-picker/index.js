import React from "react";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";

const Input = ({
  id,
  name,
  type,
  label,
  margin,
  variant,
  required,
  autoFocus,
  fullWidth,
  autoComplete,
}) => {
  return (
    <TextField
      id={id}
      name={name}
      type={type}
      label={label}
      margin={margin}
      variant={variant}
      required={required}
      autoFocus={autoFocus}
      fullWidth={fullWidth}
      autoComplete={autoComplete}
    />
  );
};

Input.propTypes = {
  id: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  margin: PropTypes.string,
  required: PropTypes.bool,
  fullWidth: PropTypes.bool,
  variant: PropTypes.string,
  autoFocus: PropTypes.bool,
  autoComplete: PropTypes.string,
};

export default Input;
