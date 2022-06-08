import tw, { styled } from "twin.macro";
import "styled-components/macro";
import cl from "../cl.png";
import { NavBarLink } from "../components/styled";
import { Link } from "react-router-dom";
import {useContext} from 'react';
import UserContext from "../components/UserContext";

const Dashboard = () => {
  const { userData } = useContext(UserContext)
  const {user} = userData;
	return (
		<>
			<img
				tw="mt-6 w-11/12 mx-auto md:w-1/2 max-w-md"
				src={cl}
				alt="Camp Leslie"
			/>
			<nav>
				<ul tw="flex flex-col gap-2 w-1/2 mx-auto mt-8">
					<NavBarLink color="green">
						<Link to="schedule/sign-up">Schedule Sign-Up</Link>
					</NavBarLink>
					<NavBarLink color="blue">
						<Link to="schedule/attendance">Attendance</Link>
					</NavBarLink>
					<NavBarLink color="red">
						<Link to="cabins/list">Cabin Lists</Link>
					</NavBarLink>
          {( user.role === "admin" || user.role === "unitHead" ) &&
            <NavBarLink color="purple">
            <Link to="cabins/assignment">Cabin Assignment</Link>
            </NavBarLink>
        }
				</ul>
			</nav>
		</>
	);
};

export default Dashboard;
