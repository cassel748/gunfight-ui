import React from "react";
import NextLink from "src/components/Button/Link";
import LoadingButton from "@material-ui/lab/LoadingButton";
import { styled } from "@material-ui/styles";

const NextLinkStyle = styled(NextLink)({
  textDecoration: "none"
});

export const LinkButton = ({ href, children, ...props }) => {
  return (
    <NextLinkStyle href={href}>
      <LoadingButton
        type="button"
        {...props}
      >
        {children}
      </LoadingButton>
    </NextLinkStyle>
  );
};
