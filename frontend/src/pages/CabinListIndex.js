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
    {weeks && weeks.map(w=>{
      return <Link to={`${w.number}`}><button tw="p-2">{w.number}</button></Link>
    }) }
      <Outlet/>
    </>
  )
}

export default CabinListIndex
