import { Button, ClickAwayListener, Menu, MenuItem } from "@mui/base";
import { useState } from "react";

const NavMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (e) => {
    e.stopPropagation()
    setAnchorEl(null);
  }

  return (
    <>
      <ClickAwayListener onClickAway={handleClose}>
        <Button
          id="basic-button"
          onClick={!open ? handleClick : handleClose}>Menu</Button>
      </ClickAwayListener>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        onClose={handleClose}
        open={open}>
        <MenuItem onClick={handleClose}>One</MenuItem>
        <MenuItem onClick={handleClose} > Two</MenuItem>
        <MenuItem onClick={handleClose}>Three</MenuItem>
      </Menu>

    </>)
}

export default NavMenu
