import { useContext } from "react";
import UserContext from "../components/UserContext";
import fetchWithToken from "../fetchWithToken";

export const assignCabins = async (cabinSession, camperSessions, auth) => {
  const url = `/api/cabin-sessions/${cabinSession.id}/campers`
  const requestConfig = {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({
      campers: camperSessions
    }),
  };
  const results = await fetchWithToken(url, requestConfig, auth);
  return results
}


