import "./App.css";
import { Route, Routes, BrowserRouter, Outlet } from "react-router-dom";
import CabinAssignmentRoutes from "./pages/CabinAssignment";
import NotFound from "./pages/NotFound";
import ScheduleRoutes from "./pages/ScheduleRoutes";
import LoginPage from "./pages/login";
import NavWrapper from "./components/NavWrapper";
import Protected from "./components/Protected";
import Dashboard from "./pages/dashboard";
import UserContext, { useUserData } from "./components/UserContext";
import CabinListPage from "./pages/CabinList";
import tw from "twin.macro";
import "styled-components/macro";
import CabinListIndex from "./pages/CabinListIndex";
import Scoreboard from "./pages/Scoreboard";
import Score from "./components/Score"
import ProgrammingSchedule from "./pages/ProgrammingSchedule";
import Slay from "./pages/Slay";
import AdminAccess from "./components/ProtectedAdminAccess";
import UsersPage from "./pages/UsersPage";
import StaffSchedule from "./pages/StaffSchedule";
import ProfilePage from "./pages/ProfilePage";
import CreateAward from "./pages/CreateAward";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import RoleProtected from "./components/protectedRoutes";
import SignUpIndex from "./pages/SignUpIndex";
import CreateSchedulePage from "./pages/CreateSchedule";
import AttendanceDisplay from "./pages/Attendance";
import AttendanceIndex from "./pages/AttendanceIndex";


function App() {
  const userState = useUserData();
  return (
    <div className="App">
      <UserContext.Provider value={userState}>
        <BrowserRouter>
          <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route path="slay" element={<Slay />} />
            <Route
              path=""
              element={
                <Protected>
                  <NavWrapper />
                </Protected>
              }
            >
              <Route
                path=""
                element={
                  <Protected>
                    <ProfilePage />
                  </Protected>
                }
              >
              </Route>

              <Route path="award" element={<CreateAward />} />
              <Route path="cabins/">
                {CabinAssignmentRoutes()}{" "}
                <Route path="list/">
                  <Route
                    index
                    element={
                      <Protected>
                        <CabinListIndex />
                      </Protected>
                    }
                  ></Route>
                </Route>
              </Route>
              <Route path="users" element={
                <RoleProtected role="admin">
                  <UsersPage />
                </RoleProtected>} />
              <Route path="scoreboard" element={<Scoreboard />}>
                <Route path=":weekNumber" element={<Score />} />
              </Route>
              <Route path="schedule" >

                <Route path="sign-up" element={<SignUpIndex />}>
                  <Route
                    path=":cabin/:weekNumber"
                    element={<CreateSchedulePage />}
                  />
                </Route>

                <Route path="activities" element={
                  <RoleProtected role="programming">
                    <ProgrammingSchedule />
                  </RoleProtected>} />

                <Route path="staff" element={
                  <RoleProtected role="unit_head">
                    <StaffSchedule />
                  </RoleProtected>} />

                <Route path="attendance" element={<AttendanceIndex />}>
                  <Route path=":periodId"
                    element={<AttendanceDisplay />}
                  />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UserContext.Provider></div>
  );
}

export default App;
