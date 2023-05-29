import tw, { styled } from "twin.macro";
import "styled-components/macro";
import cl from "../cl.png";
import { NavBarLink } from "../components/styled";
import { Link } from "react-router-dom";
import { useContext } from "react";
import UserContext from "../components/UserContext";

const Dashboard = () => {
  const { logOut, userData } = useContext(UserContext);
  const { user } = userData;
  return (
    <>
    // remove this for production
      <h1
        tw="text-white font-bold bg-red-600"> DEVELOPMENT FRONT END </h1>
      <img
        tw="mt-6 w-11/12 mx-auto md:w-1/2 max-w-md"
        src={cl}
        alt="Camp Leslie"
      />
      <nav>
        <ul tw="flex flex-col gap-2 w-1/2 mx-auto mt-8">
          <Link to="scoreboard">
            <NavBarLink color="orange">Scoreboard</NavBarLink>
          </Link>
          <Link to="schedule/sign-up">
            <NavBarLink color="green">Schedule Sign-Up</NavBarLink>
          </Link>
          <Link to="schedule/attendance"><NavBarLink color="blue">
            Attendance
          </NavBarLink></Link>
          <Link to="cabins/list"><NavBarLink color="red">
            Cabin Lists
          </NavBarLink></Link>
          {(user.role === "admin" || user.role === "unit_head") && (
            <Link to="cabins/assignment"><NavBarLink color="purple">
              Cabin Assignment
            </NavBarLink></Link>
          )}
          {user.role === "admin" && (
            <Link to="users"><NavBarLink color="brown">Users</NavBarLink></Link>
          )}
          {(user.role === "admin" || user.role === "unit_head" || user.role === "programming") && (
            <Link to="programming-schedule"><NavBarLink color="yellow">
              Programming
            </NavBarLink></Link>
          )}
          <NavBarLink
            tw="mt-8"
            onClick={() => {
              logOut();
            }}
          >
            <button>Log Out</button>
          </NavBarLink>
        </ul>
      </nav>
    </>
  );
};

export default Dashboard;
