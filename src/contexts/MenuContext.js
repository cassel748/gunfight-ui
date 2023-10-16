import PropTypes from "prop-types";
import React, { createContext } from "react";
import { STORAGE_PREFIX } from "src/utils/auth";

const initialState = {
  menuConfig: process.browser ? JSON.parse(window.localStorage.getItem(`${STORAGE_PREFIX}menuConfig`)) : [],
  setMenuData: data => {
    if (process.browser) {
      if (data === null) {
        return window.localStorage.removeItem(`${STORAGE_PREFIX}menuConfig`);
      }

      window.localStorage.setItem(`${STORAGE_PREFIX}menuConfig`, JSON.stringify(data));
    }
  }
};

const MenuContext = createContext(initialState);

MenuContext.propTypes = {
  children: PropTypes.node,
};

function MenuProvider({ children }) {
  const menuConfig = process.browser ? JSON.parse(window.localStorage.getItem(`${STORAGE_PREFIX}menuConfig`)) : [];

  return (
    <MenuContext.Provider
      value={{
        menuConfig
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export { MenuProvider, MenuContext };
