import { useCallback, useContext, useEffect, useState } from "react";
import {Link, Outlet} from "react-router-dom";
import useGetDataOnMount from "../hooks/useGetData";
import tw from 'twin.macro';
import 'styled-components/macro';

const CabinListIndex = ()=>{
  const [weeks] = useGetDataOnMount({
    url: "/api/weeks",
    useToken: true,
    initialState: [],
  });
  return (
    <>
      <header><h2 tw="text-lg font-bold">Select Week</h2></header>
      <div tw="flex gap-2 justify-center">
    {weeks && weeks.map(w=>{
      return <Link to={`${w.number}`}><button tw="p-2 bg-gray-300">{w.number}</button></Link>
      }) }
      </div>
      <Outlet/>
    </>
  )
}

export default CabinListIndex
