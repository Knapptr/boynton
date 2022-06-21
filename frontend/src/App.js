import "./App.css";
import { Route, Routes, BrowserRouter } from "react-router-dom";
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
function App() {
  const userState = useUserData();
  return (
    <div className="App">
      <div tw="max-w-3xl mx-auto">
        <UserContext.Provider value={userState}>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <Protected>
                    <Dashboard />
                  </Protected>
                }
              ></Route>
              <Route
                path="/*"
                element={
                  <Protected>
                    <NavWrapper />
                  </Protected>
                }
              >
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
                    <Route
                      path=":weekNumber"
                      element={<CabinListPage />}
                    ></Route>
                  </Route>
                </Route>
                <Route path="scoreboard" element={<Scoreboard/>}>
                  <Route path=":weekNumber" element={<Score/>}/>
                </Route>
                <Route path="cabins/*">{CabinAssignmentRoutes()}</Route>
                <Route
                  path="schedule/*"
                  element={
                    <Protected>
                      <ScheduleRoutes />
                    </Protected>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </UserContext.Provider>
      </div>
    </div>
  );
}

export default App;
