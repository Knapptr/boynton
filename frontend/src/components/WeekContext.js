import { createContext } from "react";
import useWeeks from "../hooks/useWeeks"

const WeekContext = createContext(null)

export const WeekContextProvider = ({children}) =>{
  const weeks = useWeeks(); 
  return (
  <WeekContext.Provider value={weeks}> 
    {children}
  </WeekContext.Provider>
  )
  
}

export default WeekContext
