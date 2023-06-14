import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { AppBar, Divider, Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography, Button, Menu,  MenuItem } from "@mui/material";
import { useLocation } from "react-router-dom";
import ParkTwoToneIcon from '@mui/icons-material/ParkTwoTone';
import { Box } from "@mui/system";
import { useContext, useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import { isAdmin, isProgramming, isUnitHead } from "../utils/permissions";
import UserContext from "./UserContext";

const drawerWidth = 240;

const navItems = [
  { name: 'Give Award', url: "/award" },
  // { name: 'Scores', url: "/scoreboard" },
]

const navDialogs = [
  {name: "Attendance", dialog: "attendance", reqRole: "counselor"},
  {name: "Cabin Assignment", dialog: "cabinassignment", reqRole: "unit_head"},
  {name: "Cabin Lists", dialog: "cabinlist", reqRole: "counselor"},
  {name: "Give Award", dialog:"giveaward", reqRole:"counselor"},
  {name: "Activity Schedule", dialog:"programming", reqRole:"programming"},
  { name: "Staff Scheduling", dialog: "staffing", reqRole: "admin" },
  { name: "Activity Sign-Up", dialog: "signup", reqRole:"counselor" },
]

const adminNavItems = [
  { name: "Users", url: "/users" }
]

const prepareRoleMenuItems = (items, auth) => {
  return items.filter(item => {
    switch (item.reqRole) {
      case 'admin':
        return isAdmin(auth);
      case 'unit_head':
        return isUnitHead(auth);
      case 'programming':
        return isProgramming(auth);
      case 'counselor':
        return true;
      case undefined:
        return true;
      default: return false;
    }
  }
  )
}

const NavMenuButton = ({ children, onClick }) => {
  return (<Button sx={{ color: "white" }} onClick={onClick}  >
    {children}
  </Button >)
}

const MenuDialogs = ({items,handleDialogs,auth})=>{
  const handleDialog = (dialogName)=>{
    handleDialogs(dialogName);
  }
  return prepareRoleMenuItems(items,auth).map(item=> <NavMenuButton onClick={()=>{handleDialog(item.dialog)}}>{item.name}</NavMenuButton>)
}

const DrawerDialog = ({items,handleDialogs})=>{

  const handleDialog = (dialogName) =>{
    handleDialogs(dialogName);
  }

  return (<List>
    {items.map(item =>  (<ListItem key={"drawer-" + item.name}>
        <ListItemButton component={Button} onClick={()=>{handleDialog(item.dialog)}}><ListItemText primary={item.name} /></ListItemButton>
      </ListItem>)
    )}
  </List>)
}

const NavDialogButton = ({ active, handleDialogs, item }) => {
  return (
    <Button onClick={handleDialogs} sx={{ color: "white" }} disabled={active} key={item.name} >
      {item.name}
    </Button>
  )
}

const NavContextLinkButton = ({ active, to, item }) => {
  return (
    <Button href={to} sx={{ color: "white" }} disabled={active} key={item.name} >
      {item.name}
    </Button>
  )
}

const MenuNav = ({ title }) => {
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


function NavDrawer(props) {
  const auth = useContext(UserContext);
  const location = useLocation()
  const {handleDialogs} = props;
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  



const DialogLinks = () =>{
  return <DrawerDialog handleDialogs={handleDialogs}items={prepareRoleMenuItems(navDialogs,auth)}/>}

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle}  >
   <DialogLinks /> 
  
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
    <MenuDialogs auth={auth} items={navDialogs} handleDialogs={handleDialogs}/>
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
