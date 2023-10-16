import React from "react";
import PropTypes from "prop-types";
// import styles from "./Button.module.css";
import Button from "@material-ui/core/Button";

const ButtonPrimary = ({
  href,
  type,
  color,
  title,
  variant,
  onClick,
  fullWidth,
}) => {
  return (
    <Button
      type={type}
      href={href}
      color={color}
      onClick={onClick}
      variant={variant}
      fullWidth={fullWidth}
      style={{ backgroundColor: "#961529", marginTop: 20 }}
    >
      {title}
    </Button>
  );
};

ButtonPrimary.propTypes = {
  type: PropTypes.string,
  href: PropTypes.string,
  color: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
  fullWidth: PropTypes.bool,
  variant: PropTypes.string,
};

export default ButtonPrimary;
