import React, { useState } from "react";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";
import { removeMask } from "src/utils/string";
import ReactInputMask from "react-input-mask";

const InputCellphone = ({
  error,
  label,
  value,
  name,
  style,
  fieldStyle,
  disabled,
  onChange,
  helperText,
  onCopy,
  fullWidth = true,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const localOnChange = (event) => {
    const value = event.target.value;
    const parsedValue = removeMask(event.target.value);

    if (onChange) {
      event.target.value = parsedValue;
      onChange(event);
    }

    setLocalValue(value);
  };

  return (
    <ReactInputMask
      mask="(99) 9 9999-9999"
      maskPlaceholder={null}
      onChange={localOnChange}
      value={localValue}
      disabled={disabled}
      style={style}
      maskChar={null}
      error={error}
      helperText={helperText}
    >
      {() => (
        <TextField
          name={name}
          fullWidth={fullWidth}
          label={label}
          value={localValue}
          error={error}
          helperText={helperText}
          disabled={disabled}
          style={fieldStyle}
          onCopy={onCopy}
          type="tel"
        />
      )}
    </ReactInputMask>
  );
};

InputCellphone.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  error: PropTypes.any,
  name: PropTypes.string,
  disabled: PropTypes.bool,
  helperText: PropTypes.any,
  fullWidth: PropTypes.bool,
  style: PropTypes.any,
  fieldStyle: PropTypes.any,
  onChange: PropTypes.func,
};

export default InputCellphone;
