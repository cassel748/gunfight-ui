import React, { useState } from "react";
import PropTypes from "prop-types";
import { TextField } from "@material-ui/core";
import { formatCurrency, toCurrency } from "src/utils/string";
import IntlCurrencyInput from "react-intl-currency-input";
import { useEffect } from "react";

const InputCurrency = ({ value, onChange, ...props }) => {
  const currencyConfig = {
    locale: "pt-BR",
    formats: {
      number: {
        BRL: {
          style: "currency",
          currency: "BRL",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      },
    },
  };

  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    const newValue = formatCurrency(value);
    setLocalValue(newValue);
  }, [value]);

  const onLocalChange = (event) => {
    const value = event.target.value;
    setLocalValue(value);

    setTimeout(() => {
      const formattedValue = toCurrency(value);
      if (onChange) {
        event.target.value = formattedValue === undefined ? 0 : formattedValue;
        onChange(event);
      }
    }, 1);
  };

  return (
    <IntlCurrencyInput
      onChange={onLocalChange}
      component={TextField}
      value={localValue}
      currency="BRL"
      config={currencyConfig}
      {...props}
    />
  );
};

InputCurrency.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
  onKeyPress: PropTypes.func,
};

export default InputCurrency;
