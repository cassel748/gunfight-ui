import React from "react";
import { TextField } from "@material-ui/core";
import { CircularProgress } from "@material-ui/core";
import { Autocomplete } from "@material-ui/core";
import { useState } from "react";
import throttle from 'lodash/throttle';
import { useAuthUser } from "next-firebase-auth";
import { Button } from "@material-ui/core";
import { useSelector } from "react-redux";

let lastRequestController = null;
let isFromCurrentUser = false;

const UserAutocomplete = ({
  label,
  error,
  helperText,
  autoFocus,
  fullWidth,
  onChange,
  showMeButton = true,
  onSelect
}) => {
  const AuthUser = useAuthUser();
  const userInfo = useSelector(state => state.user.userInfo);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState(null);


  const throttledSearch = throttle(async (value, signal) => {
    if (!value || isFromCurrentUser) {
      isFromCurrentUser = false;
      return;
    }

    try {
      setIsLoading(true);
      setOptions([]);

      const token = await AuthUser.getIdToken();
      const response = await fetch(`/api/user?search=${value}`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
        signal
      });

      const data = await response.json();



      if (data && data.success) {
        setOpen(true);

        if (data.hits.length === 0) {
          setOptions([{
            name: "Nenhum Usuário encontrado",
            value: "disabled",
          }]);
        } else {
          setOptions(data.hits)
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
          value: value && value.objectID ? value.objectID : ""
        }
      });

      onSelect(value);
    }

    setOpen(false);
    setInputValue(value);
  }

  const setCurrenUserAsSeller = () => {
    isFromCurrentUser = true;

    onChange({
      target: {
        value: userInfo.id
      },
      type: "change"
    });

    onSelect(userInfo);

    setInputValue(userInfo);

    setTimeout(() => {
      setOpen(false);
    }, 300);
  }


  return (
    <div style={{ display: 'flex' }}>
      <Autocomplete
        getOptionDisabled={(option) => option.value === "disabled"}
        value={inputValue}
        style={{ flex: 1, marginRight: showMeButton ? 16 : 0 }}
        open={open && options.length}
        getOptionSelected={(option, value) => option && option.name === value.name}
        getOptionLabel={(option) => option && option.name ? option.name : ""}
        options={options}
        loading={isLoading}
        noOptionsText="Nenhum Usuário encontrado"
        loadingText="Buscando..."
        onInputChange={(event, newInputValue) => {
          onInputChange(event, newInputValue);
        }}
        filterOptions={(x) => x}
        onChange={onChangeLocal}
        onBlur={() => setOpen(false)}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            error={error}
            helperText={helperText}
            autoFocus={autoFocus}
            fullWidth={fullWidth}
            variant="outlined"
            onBlur={() => { setOpen(false); setOptions([]) }}
            onFocus={() => setOpen(true)}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {isLoading ? <CircularProgress color="inherit" size={20} style={{ marginTop: -5 }} /> : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
          />
        )}
      />

      {showMeButton && (
        <Button variant="outlined" onClick={setCurrenUserAsSeller} style={{ height: 45, marginTop: -1 }}>
          Usar meu usuário
        </Button>
      )}
    </div>
  );
}

export default UserAutocomplete;
