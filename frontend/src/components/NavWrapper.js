import { Outlet } from "react-router-dom";
import AttendanceDialog from "./AttendanceDialog";
import { useState } from "react";
import NavDrawer from "./NavDrawer"; 
import CabinAssignmentDialog from "./CabinAssignmentDialog";
import {Container } from "@mui/material";
import WeekSelectDialog from "./WeekSelectDialog";
import ActivitySignUpDialog from "./ActivitySignUpDialog";

const NavWrapper = () => {
	const [openDialog,setOpenDialog] = useState(null);

	const handleDialogs = (dialogName)=>{
		console.log("Handling dialogs")
		console.log(dialogName)
		setOpenDialog(dialogName)
	}	
	const handleClose = () => {setOpenDialog(null)}


	
	
  return (
    <>
	  <NavDrawer handleDialogs={handleDialogs}/>
	  
	  <Container sx={{paddingX:0}} maxWidth="xl">

	  {/* Navigation Dialogs */}
	  <WeekSelectDialog title="Give Award" open={openDialog==="giveaward"} onClose={handleClose} url="/award"/>

	  {/* Cabin List*/}
	  <WeekSelectDialog title="Cabin List" open={openDialog==="cabinlist"} onClose={handleClose} url="/cabins/list"/>

	  {/* Programming */}
	  <WeekSelectDialog title="Edit Activity Schedule" open={openDialog==="programming"} onClose={handleClose} url="/schedule/programming" />

	  {/* Cabin Assignment */}
	  <CabinAssignmentDialog open={openDialog=== "cabinassignment"} onClose={handleClose}/>

	  {/* Attendance */}
          <AttendanceDialog open={openDialog === "attendance" } onClose={handleClose} />

	  {/* Staffing */}
	  <WeekSelectDialog title="Staffirg"
	  open={openDialog==="staffing"} onClose={handleClose} url="schedule/staffing" />

	  {/* Activity Sign Up */}
	  <ActivitySignUpDialog open={openDialog==="signup"} onClose={handleClose}/>
	  {/* App Content */}
          <Outlet />

        </Container>
    </>
  );
};

export default NavWrapper;
