import logo from "../cl.png";
import tw from "twin.macro";
import "styled-components/macro";
import { Link } from "react-router-dom";
import { useCallback, useContext, useEffect, useState } from "react";
import UserContext from "./UserContext";
import toTitleCase from "../toTitleCase";
import fetchWithToken from "../fetchWithToken";

const HeaderBar = () => {
  const auth = useContext(UserContext);

  return (
    <>
      <h1 tw="text-white bg-red-600 font-bold"> DEV FRONTEND</h1>
      <div tw="flex items-center px-4 py-2">
        <div tw="w-1/6  rounded font-bold">
          <Link to="/" >
            <h1 tw=" italic font-extralight">BOYNTON</h1>
          </Link>
        </div>
        {/*
      <button
      tw="ml-auto p-1 rounded font-thin underline"
      onClick={() => {
        user.logOut();
      }}
      >
      Logout
      </button>
    */}
        <div tw="ml-auto">
          <Link to="/profile"><span tw="select-none rounded-full bg-green-800 px-4 py-3 text-white font-bold">{auth.userData.user.username[0].toUpperCase()}</span></Link>
        </div>
      </div>
    </>
  );
};

export default HeaderBar;
