import React from "react";
import NextLink from "next/link";
import { styled } from "@material-ui/styles";

const NextLinkStyle = styled(NextLink)({
  textDecoration: "none"
});

export const NextLinkFinal = ({ href, children, ...props }) => {
  return (
    <NextLinkStyle href={href} {...props}>
      {children}
    </NextLinkStyle>
  );
};

export default NextLinkFinal;
