import { Outlet } from "react-router-dom";
import AttendanceDialog from "./AttendanceDialog";
import { useState } from "react";
import { Container } from "@mui/system";
import NavDrawer from "./NavDrawer"; 
import useWeeks from "../hooks/useWeeks";
import NavDialog from "./NavDialog";

const NavWrapper = () => {
	const [openDialog,setOpenDialog] = useState(null);
	const useweeks = useWeeks();

	const handleDialogs = (dialogName)=>{
		console.log("Handling dialogs")
		console.log(dialogName)
		setOpenDialog(dialogName)
	}
	const handleClose = () => {setOpenDialog(null)}

	const getAttendanceUrl = () => {
		return `/schedule/attendance/${useweeks.selectedPeriod()?.id}`
	}
	
  return (
    <>
	  <NavDrawer handleDialogs={handleDialogs}/>
      <Container maxWidth="xl">
          <NavDialog url={getAttendanceUrl} useweeks={useweeks} open={openDialog === "attendance"} onClose={handleClose} />
          <Outlet />
        </Container>
    </>
  );
};

export default NavWrapper;
