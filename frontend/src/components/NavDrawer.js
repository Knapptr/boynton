import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { Link, AppBar, CssBaseline, Divider, Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography, Button, Menu, Container, MenuItem } from "@mui/material";
import { useLocation } from "react-router-dom";
import ParkTwoToneIcon from '@mui/icons-material/ParkTwoTone';
import { Box } from "@mui/system";
import { useContext, useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import { NavBarLink } from "./styled";
import { isAdmin, isProgramming, isUnitHead } from "../utils/permissions";
import UserContext from "./UserContext";

const drawerWidth = 240;

const navItems = [
  { name: 'Attendance', url: "/schedule/attendance" },
  { name: 'Give Award', url: "/award" },
  { name: 'Cabin Lists', url: "/cabins/list" },
  // { name: 'Scores', url: "/scoreboard" },
]

const adminNavItems = [
  { name: "Users", url: "/users" }
]

const regMenuItems = [
  { name: "Activity Sign-Up", url: "/schedule/sign-up" },
  { name: "Cabin Assignment", url: "/cabins/assignment", reqRole: "unit_head" },
  { name: "Programming", url: "/schedule/activities", reqRole: "admin" },
  { name: "Staff Scheduling", url: "/schedule/staff", reqRole: "programming" }
]


const NavContextLinkList = ({ active, to, item }) => {
  return (
    <ListItem key={`link-${item.name}`}>
      <ListItemButton hrey={item.url} >
        <ListItemText color="success" primary={item.name} />
      </ListItemButton>
    </ListItem>
  )
}


const NavContextLinkButton = ({ active, to, item }) => {
  return (
    <Button href={to} sx={{ color: "white" }} disabled={active} key={item.name} >
      {item.name}
    </Button>
  )
}
const NavMenuButton = ({ children, onClick }) => {
  return (<Button sx={{ color: "white" }} onClick={onClick}  >
    {children}
  </Button >)
}

const MenuNav = ({ title, items, auth }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (

    <>
      <NavMenuButton onClick={handleMenu}>
        <Typography >{title}</Typography>
      </NavMenuButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {prepareRoleMenuItems(items, auth).map(item =>
          <MenuItem key={`menu-item-${item.name}`} onClick={handleClose}><Button href={item.url}>{item.name}</Button></MenuItem>
        )}
      </Menu>
    </>
  )
}

const DrawerNav = ({ items, auth }) => {
  return (<List>
    {prepareRoleMenuItems(items, auth).map(item => {
      return (<ListItem key={item.name}>
        <ListItemButton component={Button} href={item.url} ><ListItemText primary={item.name} /></ListItemButton>
      </ListItem>)
    })}
  </List>
  )
}

const prepareRoleMenuItems = (items, auth) => {
  return items.filter(item => {
    switch (item.reqRole) {
      case 'admin':
        return isAdmin(auth);
      case 'unit_head':
        return isUnitHead(auth);
      case 'programming':
        return isProgramming(auth);
      case undefined:
        return item;
      default: return false;
    }
  }
  )
}

function NavDrawer(props) {
  const auth = useContext(UserContext);
  const location = useLocation()
  console.log({ location });
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle}  >
      <List >
        <DrawerNav items={navItems} />
      </List>
      <Divider />
      <DrawerNav items={regMenuItems} auth={auth} />
      <Divider />
      <DrawerNav items={adminNavItems} auth={auth} />
      <Box
        sx={{ display: 'flex', width: "100%", justifyContent: "center", marginTop: "4rem" }}
      >
        <Button
          variant="outlined"
          color="warning"
          onClick={auth.logOut}>
          Log Out
        </Button>
      </Box>
    </Box >
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <>
      <AppBar position="sticky" component="nav">
        <Box width="100%">
          <Toolbar>
            <Button
              href="/"
              size="large"
              sx={{
                marginRight: "auto",
                color: "black",
                fontSize: "2rem",
              }}
              startIcon={<ParkTwoToneIcon />} >
              Boynton
            </Button>

            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              {navItems.map((item) => (
                <NavContextLinkButton key={`appbar-link-${item.name}`} item={item} active={location.pathname.startsWith(item.url)} to={item.url} />
              ))}
              <MenuNav auth={auth} title="Scheduling" items={regMenuItems} />
              <MenuNav auth={auth} title="Admin" items={adminNavItems} />
              <Button
                sx={{ marginLeft: "2rem" }}
                onClick={auth.logOut}
                variant="outlined"
                color="warning" >Log Out </Button>
            </Box>
          </Toolbar>
        </Box>
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
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
}

export default NavDrawer
