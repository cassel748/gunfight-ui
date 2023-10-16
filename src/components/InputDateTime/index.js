import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { DateTimePicker } from "@material-ui/lab";
import TextField from "@material-ui/core/TextField";
import { getDateLocalized } from "src/utils/localizedDateFns";

const InputDateTime = ({
  error,
  label,
  value,
  style,
  disabled,
  onChange,
  helperText,
  fullWidth = true,
}) => {
  const inputRef = useRef();
  const [localValue, setLocalValue] = useState(
    value && value.length === 16 ? getDateLocalized(new Date(value), "dd/MM/yyyy HH:mm") : ""
  );

  function moveCursorToEnd(el) {
    if (typeof el.selectionStart == "number") {
      el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != "undefined") {
      el.focus();
      var range = el.createTextRange();
      range.collapse(false);
      range.select();
    }
  }

  return (
    <DateTimePicker
      label={label}
      value={value}
      ref={inputRef}
      disabled={disabled}
      onChange={(changedValue, stringValue) => {
        onChange({
          target: {
            value: changedValue ? changedValue : ""
          }
        });

        if (changedValue === null) {
          return setLocalValue("");
        }

        if (!stringValue) {
          setLocalValue(getDateLocalized(new Date(changedValue), "dd/MM/yyyy HH:mm"));
          onChange({
            target: {
              value: getDateLocalized(new Date(changedValue), "MM-dd-yyyy HH:mm")
            }
          });
          return;
        }

        setLocalValue(stringValue);

        if (stringValue && stringValue.length === 10) {
          onChange({
            target: {
              value: getDateLocalized(new Date(changedValue), "MM-dd-yyyy HH:mm")
            }
          });
        }

        if (inputRef.current && inputRef.current.querySelector) {
          setTimeout(() => {
            moveCursorToEnd(inputRef.current.querySelector("input"));
          }, 10);
        }
      }}
      inputProps={{
        placeholder: "",
        value: localValue,
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          error={error}
          style={style}
          disabled={disabled}
          fullWidth={fullWidth}
          helperText={helperText}
        />
      )}
    />
  );
};

InputDateTime.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  error: PropTypes.any,
  disabled: PropTypes.bool,
  helperText: PropTypes.any,
  fullWidth: PropTypes.bool,
  style: PropTypes.any,
};

export default InputDateTime;
