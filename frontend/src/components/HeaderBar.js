import logo from "../cl.png";
import tw from "twin.macro";
import "styled-components/macro";
import { Link } from "react-router-dom";
import { useContext } from "react";
import UserContext from "./UserContext";
import toTitleCase from "../toTitleCase";

const HeaderBar = () => {
  const user = useContext(UserContext);
  return (
      <div tw="">
        <div tw="w-1/6">
          <Link to="/">
          <img  tw="" src={logo} alt="Camp Leslie" />
          </Link>
        </div>
        <button
          tw="ml-auto p-1 rounded font-thin underline"
          onClick={() => {
            user.logOut();
          }}
        >
          Logout
        </button>
        <span tw="rounded-full bg-green-800 px-4 py-2 text-white font-bold">{user.userData.user.userName[0].toUpperCase()}</span>
      </div>
  );
};

export default HeaderBar;
