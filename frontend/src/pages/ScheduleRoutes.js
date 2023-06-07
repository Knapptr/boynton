import { Routes, Route, Outlet } from "react-router-dom";
import CreateSchedulePage from "./CreateSchedule";
import SignUpIndex from "./SignUpIndex";
import AttendanceIndex from "./AttendanceIndex";
import Attendance from "./Attendance";

const ScheduleRoutes = () => {
    return (
        <>
            <AttendanceIndex />
            <Routes>
                <Route path="sign-up" element={<SignUpIndex />}></Route>
                <Route
                    path="sign-up/:cabin/:weekNumber"
                    element={<CreateSchedulePage />}
                ></Route>
                <Route path="attendance/:periodId"
                    element={<Attendance />}
                />
                {/*<Route index element={<AttendanceIndex />}></Route>*/}
            </Routes>
            <Outlet />
        </>
    );
};

export default ScheduleRoutes;
