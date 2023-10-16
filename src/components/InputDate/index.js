import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { DatePicker } from "@material-ui/lab";
import TextField from "@material-ui/core/TextField";
import { getDateLocalized } from "src/utils/localizedDateFns";

const isValidDate = d => {
  return d instanceof Date && !isNaN(d);
}

const InputDate = ({
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
  const startValue = value && value.length === 10 ? getDateLocalized(new Date(value), "dd/MM/yyyy") : "";
  const [localValue, setLocalValue] = useState(startValue);

  useEffect(() => {
    const newValue = value && value.length === 10 ? getDateLocalized(new Date(value), "dd/MM/yyyy") : value;
    setLocalValue(newValue);
  }, [value]);

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
    <DatePicker
      label={label}
      value={value}
      ref={inputRef}
      disabled={disabled}
      cancelText="Cancelar"
      onChange={(changedValue, stringValue) => {
        onChange({
          target: {
            value: changedValue && isValidDate(changedValue) ? changedValue : ""
          }
        });

        if (changedValue === null) {
          return setLocalValue("");
        }

        if (!stringValue) {
          setLocalValue(getDateLocalized(new Date(changedValue), "dd/MM/yyyy"));
          onChange({
            target: {
              value: getDateLocalized(new Date(changedValue), "MM-dd-yyyy")
            }
          });
          return;
        }

        if (stringValue && stringValue.length < 10) {
          onChange({
            target: {
              value: stringValue
            }
          });
        }

        if (stringValue && stringValue.length === 10) {
          onChange({
            target: {
              value: getDateLocalized(new Date(changedValue), "MM-dd-yyyy")
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

InputDate.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  error: PropTypes.any,
  disabled: PropTypes.bool,
  helperText: PropTypes.any,
  fullWidth: PropTypes.bool,
  style: PropTypes.any,
};

export default InputDate;
