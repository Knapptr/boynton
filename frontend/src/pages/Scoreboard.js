import { MenuSelector } from "../components/styled";
import { NavLink, Outlet,Link, useResolvedPath, useLocation } from "react-router-dom";
import tw, { styled } from "twin.macro";
import "styled-components/macro";

const weeks = [1, 2, 3, 4, 5, 6];

const WeekLink = ({to,children})=>{
  const NLink = styled(Link)(( {isActive} )=>[tw`p-2 rounded bg-slate-300`,isActive && tw`bg-green-400`])
  const location = useLocation();
  const resolvedPath = useResolvedPath(to);
  return <NLink to={to}  isActive={location.pathname === resolvedPath.pathname}>{children}</NLink>
}
  const Scoreboard = () => {
  const path =useLocation();
  console.log(path);
  return (
    <>
    
      <div tw="mb-11">
      <h2>Week:</h2>
        <ul tw="flex justify-center gap-2">
    {weeks.map((w) => (
          <WeekLink  to={`${w}`}>
          {w}
      </WeekLink>
        ))}
        </ul>
      </div>
      <Outlet />
    </>
  );
};

export default Scoreboard;
