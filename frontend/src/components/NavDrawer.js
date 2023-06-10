import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { AppBar, CssBaseline, Divider, Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography, Button, Menu, MenuItem } from "@mui/material";
import { Link, NavLink, useLocation } from "react-router-dom";
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

const TAILWIND = { greenBg: "#17A34A", darkBg: "#091929" }

const NavContextLinkList = ({ active, to, item }) => {
  return (<Link to={to} >
    <ListItem tw="my-2" css={[tw`bg-green-700 w-11/12 mx-auto`, active && tw`bg-amber-600`]} key={item.name}>
      <ListItemButton tw="text-center">
        <ListItemText primary={<p tw="text-white font-bold">{item.name}</p>} />
      </ListItemButton>
    </ListItem>
  </Link>)
}

const DrawerItem = ({ children }) => {
  return (<ListItem tw="my-2" css={[tw`bg-green-700`]} >
    {children}
  </ListItem>)
}

const NavContextLinkButton = ({ active, to, item }) => {
  return (<Link to={to} >
    <Button tw="my-2 mx-2" sx={{ color: "black" }} disabled={active} key={item.name} >
      {item.name}
    </Button>
  </Link>)
}
const NavMenuButton = ({ children, onClick, background }) => {
  return (<Button onClick={onClick} tw="my-2 mx-2" sx={{ color: "black", background }}>
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
        <p>{title}</p>
      </NavMenuButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
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
          <MenuItem onClick={handleClose}><Link to={item.url}>{item.name}</Link></MenuItem>
        )}
      </Menu>
    </>
  )
}

const DrawerNav = ({ items, auth }) => {
  return (<List>
    {prepareRoleMenuItems(items, auth).map(item => {
      return (<Link to={item.url} tw=""><ListItem tw="my-2" css={[tw`bg-green-700 w-11/12 mx-auto`]} key={item.name}>
        <ListItemText primary={<p tw="text-center text-white font-bold">{item.name}</p>} />
      </ListItem></Link>)
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
    <Box sx={{ background: TAILWIND.darkBg }} onClick={handleDrawerToggle} >

      <Link to="/">
        <Typography variant="h6" align="center" tw="mx-2 text-white font-bold">
          Boynton
        </Typography>
      </Link>
      <Divider tw="bg-green-500 my-4" />
      <List >
        {navItems.map((item) => (
          <NavContextLinkList key={`drawer-link-${item.name}`} item={item} active={location.pathname.startsWith(item.url)} to={item.url} />
        ))}
      </List>
      <Divider tw="bg-green-500" />
      <DrawerNav items={regMenuItems} auth={auth} />
      <Divider tw="bg-green-500" />
      <DrawerNav items={adminNavItems} auth={auth} />
      <div tw="w-full flex justify-center mt-24">
        <button tw=" rounded w-9/12 bg-red-600 py-4 text-white font-bold hover:bg-red-700" onClick={auth.logOut}><span >Log Out</span></button>
      </div>
    </Box >
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <>
      <AppBar position="sticky" component="nav" tw="bg-green-600">
        <div tw="w-full max-w-7xl mx-auto flex justify-center">
          <Toolbar tw="w-full">
            <Link
              tw="mr-auto block"
              to="/">
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
              tw="mr-2 block md:hidden"
            >
              <MenuIcon />
            </IconButton>
            <Box tw="ml-auto hidden md:block " >
              {navItems.map((item) => (
                <NavContextLinkButton key={`appbar-link-${item.name}`} item={item} active={location.pathname.startsWith(item.url)} to={item.url} />
              ))}
              <MenuNav auth={auth} title="Scheduling" items={regMenuItems} />
              <MenuNav auth={auth} title="Admin" items={adminNavItems} />
              <NavMenuButton onClick={auth.logOut} >Log Out </NavMenuButton>
            </Box>
          </Toolbar>
        </div>
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
          tw="block md:hidden"
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, background: TAILWIND.darkBg },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
}

export default NavDrawer
