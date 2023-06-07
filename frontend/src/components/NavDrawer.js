import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { AppBar, CssBaseline, Divider, Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography, Button } from "@mui/material";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Box } from "@mui/system";
import { useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import { NavBarLink } from "./styled";

const drawerWidth = 240;

const navItems = [
  { name: 'Attendance', url: "/schedule/attendance" },
  { name: 'Give Award', url: "/award" },
  { name: 'Cabin Lists', url: "/cabins/list" },
  { name: 'Activity Sign-Up', url: "/schedule/sign-up" },
  { name: 'Scores', url: "/scoreboard" },]

const TAILWIND = { greenBg: "#17A34A", darkBg: "#091929" }

const NavContextLinkList = ({ active, to, item }) => {
  return (<Link to={to} >
    <ListItem tw="my-2" css={[tw`bg-green-700`, active && tw`bg-amber-600`]} key={item.name} disablePadding>
      <ListItemButton tw="text-center">
        <ListItemText primary={item.name} tw="text-white" />
      </ListItemButton>
    </ListItem>
  </Link>)
}

const NavContextLinkButton = ({ active, to, item }) => {
  return (<Link to={to} >
    <Button tw="my-2 mx-2" sx={{ color: "black" }} disabled={active} key={item.name} disablePadding>
      {item.name}
    </Button>
  </Link>)
}

function NavDrawer(props) {
  const location = useLocation()
  console.log({ location });
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box sx={{ background: TAILWIND.darkBg }} onClick={handleDrawerToggle} >

      <Link to="/">
        <Typography variant="h6" align="center" tw="mx-2 text-white font-bold">
          Boynton
        </Typography>
      </Link>
      <Divider />
      <List >
        {navItems.map((item) => (
          <NavContextLinkList key={`drawer-link-${item.name}`} item={item} active={location.pathname.startsWith(item.url)} to={item.url} />
        ))}
      </List>
    </Box >
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar component="nav" tw="bg-green-600">
        <Toolbar>
          <Link
            tw="mr-auto block"
            to="/profile">
            <Typography
              variant="h5"
              component="div"
            >
              Boynton
            </Typography>
          </Link>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            tw="mr-2 block sm:hidden"
          >
            <MenuIcon />
          </IconButton>
          <Box tw="ml-auto hidden sm:block " >
            {navItems.map((item) => (
              <NavContextLinkButton key={`appbar-link-${item.name}`} item={item} active={location.pathname.startsWith(item.url)} to={item.url} />
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          container={container}
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          tw="block sm:hidden"
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, background: TAILWIND.darkBg },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ p: 3 }}>
        <Toolbar />
      </Box>
    </Box >
  );
}

export default NavDrawer
