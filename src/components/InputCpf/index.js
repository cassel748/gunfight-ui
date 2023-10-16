import React, { useState } from "react";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";
import { removeMask } from "src/utils/string";
import ReactInputMask from "react-input-mask";

const InputCpf = ({
  error,
  label,
  value,
  style,
  fieldStyle,
  disabled,
  onChange,
  helperText,
  fullWidth = true,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [localError, setLocalError] = useState(error);
  const [localHelperText, setLocalHelperText] = useState(helperText);

  function isValidCPF(r){if("string"!=typeof r)return!1;if(!(r=r.replace(/[\s.-]*/gim,""))||11!=r.length||"00000000000"==r||"11111111111"==r||"22222222222"==r||"33333333333"==r||"44444444444"==r||"55555555555"==r||"66666666666"==r||"77777777777"==r||"88888888888"==r||"99999999999"==r)return!1;for(var n,t=0,s=1;s<=9;s++)t+=parseInt(r.substring(s-1,s))*(11-s);if(10!=(n=10*t%11)&&11!=n||(n=0),n!=parseInt(r.substring(9,10)))return!1;t=0;for(s=1;s<=10;s++)t+=parseInt(r.substring(s-1,s))*(12-s);return 10!=(n=10*t%11)&&11!=n||(n=0),n==parseInt(r.substring(10,11))}

  const localOnChange = event => {
    const value = event.target.value;
    const parsedValue = removeMask(event.target.value);

    setLocalError(false);
    setLocalHelperText("");

    if (isValidCPF(parsedValue) && onChange) {    
      event.target.value = parsedValue;
      onChange(event);
    } else if (!isValidCPF(parsedValue) && parsedValue && parsedValue.length === 11) {
      setLocalError(true);
      setLocalHelperText("CPF Inválido");
    }

    setLocalValue(value);
  };

  return (
    <ReactInputMask
      mask="999.999.999-99"
      onChange={localOnChange}
      value={localValue}
      disabled={disabled}
      style={style}
      maskChar={null}
    >
      {() => 
        <TextField
          name="cpf"
          fullWidth={fullWidth}
          label={label}
          value={localValue}
          error={localError}
          helperText={localHelperText}
          disabled={disabled}
          style={fieldStyle}
          
          type="tel"
        />
      }
    </ReactInputMask>
  );
};

InputCpf.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  error: PropTypes.any,
  disabled: PropTypes.bool,
  helperText: PropTypes.any,
  fullWidth: PropTypes.bool,
  style: PropTypes.any,
  fieldStyle: PropTypes.any,
  onChange: PropTypes.func,
};

export default InputCpf;
