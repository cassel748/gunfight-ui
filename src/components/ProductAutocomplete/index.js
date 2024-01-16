import React from "react";
import { TextField } from "@material-ui/core";
import { CircularProgress } from "@material-ui/core";
import { Autocomplete } from "@material-ui/core";
import { useState } from "react";
import throttle from "lodash/throttle";
import { useAuthUser } from "next-firebase-auth";

let lastRequestController = null;
let lastValue = null;

const ProductAutocomplete = ({
  label,
  error,
  helperText,
  autoFocus,
  fullWidth,
  style,
  onChange,
  onSelect,
  multiple,
}) => {
  const AuthUser = useAuthUser();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState([]);

  const throttledSearch = throttle(async (value, signal) => {
    if (!value) {
      return;
    }

    try {
      setIsLoading(true);
      setOptions([]);

      const token = await AuthUser.getIdToken();
      const response = await fetch(`/api/internal/products?search=${value}`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
        signal,
      });

      const data = await response.json();

      if (data && data.success) {
        setOpen(true);

        if (data.hits.length === 0) {
          setOptions([
            {
              title: "Nenhum Produto encontrado",
              value: "disabled",
            },
          ]);
        } else {
          setOptions(data.hits);
        }

        if (data.hits.length === 1) {
          const firstItem = data.hits[0];

          // Se usuario escanear barcode, ja insere o produto no campo
          if (firstItem.barcode === lastValue) {
            document
              .querySelector(".MuiAutocomplete-popper")
              .querySelector("li")
              .click();
          }
        }
      }
    } catch (e) {
      //console.log(e);
    }

    setIsLoading(false);
  }, 200);

  const onInputChange = (event, value) => {
    if (event && event.type && event.type === "click") {
      return;
    }

    if (lastRequestController) {
      lastRequestController.abort();
      lastRequestController = null;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    lastRequestController = controller;
    lastValue = value;
    throttledSearch(value, signal);
  };

  const onChangeLocal = (event, value) => {
    if (onChange) {
      let _value;
      if (multiple)
        _value = value && value.length > 0 ? value.map((v) => v.objectID) : [];
      else _value = value && value.objectID ? value.objectID : "";

      onChange({
        target: {
          value: _value,
        },
      });
      if (value && value.type) {
        onSelect(value);
      }
      setOpen(false);
    }
  };

  const space = "\n" + "\n";

  const titletoLabel = (option) => {
    if (option.color === undefined) option.color = "\n";
    if (option.size === undefined) option.size = "\n";
    return option.title + space + option?.color + space + option?.size;
  };

  return (
    <Autocomplete
      open={open}
      multiple={multiple}
      getOptionDisabled={(option) => option.value === "disabled"}
      getOptionSelected={(option, value) =>
        option.title === value.title || option.barcode === value.barcode
      }
      getOptionLabel={(option) => titletoLabel(option)}
      options={options}
      loading={isLoading}
      noOptionsText="Nenhum Produto encontrado"
      loadingText="Buscando..."
      onInputChange={(event, newInputValue) => {
        onInputChange(event, newInputValue);
      }}
      filterOptions={(x) => x}
      onChange={onChangeLocal}
      renderInput={(params) => (
        <TextField
          style={style}
          {...params}
          label={label}
          error={error}
          helperText={helperText}
          autoFocus={autoFocus}
          fullWidth={fullWidth}
          variant="outlined"
          value={lastValue}
          onBlur={() => {
            setTimeout(() => {
              setOpen(false);
              setOptions([]);
            }, 150);
          }}
          onFocus={() => setOpen(options.length > 0)}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {isLoading ? (
                  <CircularProgress
                    color="inherit"
                    size={20}
                    style={{ marginTop: -5 }}
                  />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
};

export default ProductAutocomplete;
