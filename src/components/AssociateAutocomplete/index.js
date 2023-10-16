import React from "react";
import { TextField } from "@material-ui/core";
import { CircularProgress } from "@material-ui/core";
import { Autocomplete } from "@material-ui/core";
import { useState } from "react";
import throttle from "lodash/throttle";
import { useAuthUser } from "next-firebase-auth";

let lastRequestController = null;

const AssociateAutocomplete = ({
  label,
  error,
  helperText,
  autoFocus,
  fullWidth,
  onChange,
  onSelect,
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
      const response = await fetch(`/api/associate/data?search=${value}`, {
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
              name: "Nenhum Associado encontrado",
              value: "disabled",
            },
          ]);
        } else {
          setOptions(data.hits);
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

    throttledSearch(value, signal);
  };

  const onChangeLocal = (event, value) => {
    if (onChange) {
      onChange({
        target: {
          value: value && value.objectID ? value.objectID : "",
        },
      });
      onSelect(value);
      setOpen(false);
    }
  };

  return (
    <Autocomplete
      open={open && options.length}
      getOptionDisabled={(option) => option.value === "disabled"}
      getOptionSelected={(option, value) => option.name === value.name}
      getOptionLabel={(option) =>
        `${option.affiliationNumber ? option.affiliationNumber + " - " : ""}${
          option.name
        }`
      }
      options={options}
      loading={isLoading}
      noOptionsText="Nenhum Associado encontrado"
      loadingText="Buscando..."
      onInputChange={(event, newInputValue) => {
        onInputChange(event, newInputValue);
      }}
      filterOptions={(x) => x}
      onChange={onChangeLocal}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={error}
          helperText={helperText}
          autoFocus={autoFocus}
          fullWidth={fullWidth}
          variant="outlined"
          onBlur={() => {
            setOpen(false);
            setOptions([]);
          }}
          onFocus={() => setOpen(true)}
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

export default AssociateAutocomplete;
