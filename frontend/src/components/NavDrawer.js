import "styled-components/macro";
import { AppBar, Divider, Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography, Button, Menu,  MenuItem, Stack } from "@mui/material";
import { useLocation } from "react-router-dom";
import ParkTwoToneIcon from '@mui/icons-material/ParkTwoTone';
import { Box } from "@mui/system";
import { useContext, useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import { isAdmin, isProgramming, isUnitHead } from "../utils/permissions";
import UserContext from "./UserContext";

// Consts
const drawerWidth = 240;


// Nav menu items that spawn a dialog box
const navDialogs = [
  {label: "Attendance", dialog: "attendance", reqRole: "counselor"},
  {label: "Activity Sign-Up", dialog: "signup", reqRole:"counselor" },
  {label: "Cabin Lists", dialog: "cabinlist", reqRole: "counselor"},
  {label: "Give Award", dialog:"giveaward", reqRole:"counselor"},
  {label: "Activity Schedule", dialog:"programming", reqRole:"programming"},
  {label: "Cabin Assignment", dialog: "cabinassignment", reqRole: "unit_head"},
  {label: "Staff Scheduling", dialog: "staffing", reqRole: "admin" },
]

/** App bar items that spawn dialogs*/
const appBarDialogOptions = [
  {label: "Attendance", dialog: "attendance", reqRole: "counselor"},
  {label: "Activity Sign-Up", dialog: "signup", reqRole:"counselor" },
  {label: "Cabin Lists", dialog: "cabinlist", reqRole: "counselor"},
  {label: "Give Award", dialog:"giveaward", reqRole:"counselor"},
]

/** Schedule Menu that each open dialogs **/
const scheduleMenuOptions =[
  {label: "Cabin Assignment", dialog: "cabinassignment", reqRole: "unit_head"},
  {label: "Activity Schedule", dialog:"programming", reqRole:"programming"},
  {label: "Staff Scheduling", dialog: "staffing", reqRole: "admin" },
]

// Nav items for admin only
const adminNavItems = [
  {label: "Users", url: "/users" }
]

/** Filter role based links on reqRole property*/
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

 
/** Nav menu button that is not a link*/
const NavMenuButton = ({ children, onClick }) => {
  return (<Button sx={{ color: "white" }} onClick={onClick}  >
    {children}
  </Button >)
}

/** Turn items into nav bar dialog options*/
const MenuDialogs = ({items,handleDialogs,auth})=>{
  const handleDialog = (dialogName)=>{
    handleDialogs(dialogName);
  }
  return prepareRoleMenuItems(items,auth).map(item=> <NavMenuButton key={`nav-${item.label}`}onClick={()=>{handleDialog(item.dialog)}}>{item.label}</NavMenuButton>)
}

/** Turn items into drawer dialog options */
const DrawerDialogs = ({items,handleDialogs,auth})=>{

  const handleDialog = (dialogName) =>{
    handleDialogs(dialogName);
  }

  return (<List>
    {prepareRoleMenuItems(items,auth).map(item =>  (<ListItem key={"drawer-" + item.label}>
        <ListItemButton component={Button} onClick={()=>{handleDialog(item.dialog)}}><ListItemText primary={item.label} /></ListItemButton>
      </ListItem>)
    )}
  </List>)
}


/** A Menu that opens on click*/
const MenuNav = ({ title,items,onClick }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleItemClick = (item) =>{

    onClick && onClick(item)
    handleClose();
    
  }
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
    {items.map(item=><MenuItem key={`menuItem-${item.label}`}>

    <Button onClick={()=>{handleItemClick(item)}}href={item.url}>{item.label}</Button>

      </MenuItem>)}
      </Menu>
    </>
  )
}

/** The navigation options on the Drawer */
const DrawerNav = ({ items, auth }) => {
  return (<List>
    {prepareRoleMenuItems(items, auth).map(item => {
      return (<ListItem key={`drawer-nav-${item.name}`}>
        <ListItemButton component={Button} href={item.url} ><ListItemText primary={item.label} /></ListItemButton>
      </ListItem>)
    })}
  </List>
  )
}



/** The main App Bar and Drawer*/
function NavDrawer(props) {
  const auth = useContext(UserContext);
  const {handleDialogs} = props;
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  /** The Drawer itself*/
  const drawer = (
    <Box onClick={handleDrawerToggle}  >

   <DrawerDialogs handleDialogs = {handleDialogs} auth={auth} items={navDialogs}/> 
  
      <Divider />

    {/* Admin items at bottom */}
    {isAdmin(auth)&&<DrawerNav items={adminNavItems} auth={auth} />}
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
    <Stack direction="row" alignItems="center" mr="auto">

              <IconButton href="/"><ParkTwoToneIcon sx={{fontSize:40}} /></IconButton>
            <Button
              href="/"
              size="large"
              sx={{
                color: "black",
                fontSize: "2rem",
                  padding:0
              }}>
              Boynton
            </Button>

    </Stack>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
    
              sx={{ml:"auto", display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
            <MenuDialogs auth={auth} items={appBarDialogOptions} handleDialogs={handleDialogs}/>
            
    {isProgramming(auth) &&<MenuNav 
                auth={auth}
                title="Schedule"
                items={prepareRoleMenuItems(scheduleMenuOptions,auth)}
                onClick={(item)=>{handleDialogs(item.dialog)}}/>}
            
    {isAdmin(auth) &&
            <MenuNav auth={auth} title="Admin" items={adminNavItems} />
    }
              <Button
                sx={{ marginLeft: "2rem" }}
                onClick={auth.logOut}
                variant="outlined"
    size="small"
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
