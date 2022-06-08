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
    <>
      <div tw="flex items-center justify-end p-2 bg-white">
        <p tw="mr-8">Hello, {toTitleCase(user.userData.user.userName)}</p>
        <button
          tw="mr-auto bg-red-300 p-3 rounded"
          onClick={() => {
            user.logOut();
          }}
        >
          Logout
        </button>
        <Link tw="w-1/6 md:w-1/12  mr-3" to="/">
          <img tw="" src={logo} alt="Camp Leslie" />
        </Link>
      </div>
    </>
  );
};

export default HeaderBar;
