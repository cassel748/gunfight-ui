import React from "react";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";

const DatePicker = ({ type, label, defaultValue, error, helperText }) => {
  return (
    <TextField
      fullWidth
      type={type}
      label={label}
      InputLabelProps={{
        shrink: true,
      }}
      error={error}
      helperText={helperText}
      defaultValue={defaultValue}
    />
  );
};

DatePicker.propTypes = {
  type: PropTypes.string,
  error: PropTypes.bool,
  label: PropTypes.string,
  helperText: PropTypes.string,
  defaultValue: PropTypes.string,
};

export default DatePicker;
