import Head from "next/head";
import PropTypes from "prop-types";
import { forwardRef } from "react";
import { Box } from "@material-ui/core";

// ----------------------------------------------------------------------

const Page = forwardRef(({ children, title = "", ...other }, ref) => (
  <Box ref={ref} {...other}>
    <Head>
      <title>{title}</title>
    </Head>
    {children}
  </Box>
));

Page.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Page;
