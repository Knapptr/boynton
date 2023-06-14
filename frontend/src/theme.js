import React from "react";
import PropTypes from "prop-types";
import { Link as RouterLink, MemoryRouter } from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server';
import { createTheme } from '@mui/material/styles';
import { brown, green, grey, red, yellow } from "@mui/material/colors";

// Make The Button / MUI link work with React router nicely for fast page changes
const LinkBehavior = React.forwardRef((props, ref) => {
  const { href, ...other } = props;
  // Map href (MUI) -> to (react-router)
  return <RouterLink data-testid="custom-link" ref={ref} to={href} {...other} />;
});

LinkBehavior.propTypes = {
  href: PropTypes.oneOfType([
    PropTypes.shape({
      hash: PropTypes.string,
      pathname: PropTypes.string,
      search: PropTypes.string,
    }),
    PropTypes.string,
  ]).isRequired,
};

function Router(props) {
  const { children } = props;
  if (typeof window === 'undefined') {
    return <StaticRouter location="/">{children}</StaticRouter>;
  }

  return <MemoryRouter>{children}</MemoryRouter>;
}

Router.propTypes = {
  children: PropTypes.node,
};
// A custom theme for this app
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 990,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#4f7947',
      light: "#588350",
    },
    secondary: {
      main: '#714779',
    },
    teal: {
      light: "#93cbc7",
      main: "#93cbc7",
      dark:  "#93cbc7",
      contrastText: "#000000"
    },
    background: {
      // Other potential default bg colors
      // default: '#e9f4ee',
      //default: "#E2EEE7",
      default: "#D3E8D7",
      primary: {
        light: "#aaba77"
      },
      paper: '#ccd6ac',
      alt: "#D6D0AC",
      alt2: "#9f9538",
      secondary: "#a178a5",
    blue: "#a3aabf",
    teal: {
      light: "#93cbc7",
      main: "#93cbc7",
      dark:  "#93cbc7",
      contrastText: "#000000"
    }

      
    },
    warning: {
      main: '#ed7002',
    },
    success: {
      main: '#66bb6a'
    },
    error: {
      main: "#f44336"
    },
    badges: {
      lifeguard: red[700],
      archery: yellow[900],
      ropes: brown[700],
      firstYear: green[800],
      senior: "black"
    },
  },
  components: {
    MuiLink: { defaultProps: { component: LinkBehavior } },
    MuiButtonBase: { defaultProps: { LinkComponent: LinkBehavior } }
  },

});

export default theme;
