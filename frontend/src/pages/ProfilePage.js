import { useCallback, useContext, useEffect, useState } from "react";
import UserContext from "../components/UserContext";
import fetchWithToken from "../fetchWithToken";
import tw, { styled } from "twin.macro";
import "styled-components/macro";


const ProfilePage = () => {
  const auth = useContext(UserContext);
  const [userData, setUserData] = useState(undefined);

  const getUserData = useCallback(async () => {
    const url = `api/users/${auth.userData.user.username}`
    const response = await fetchWithToken(url, {}, auth);
    return response
  }, [auth])

  const handleGetUser = useCallback(async () => {
    const response = await getUserData();
    if (response.status !== 200) { console.error("Big time error") }
    const userData = await response.json();
    setUserData(userData);
  }, [getUserData])

  useEffect(() => { handleGetUser() }, [handleGetUser]);
  return (
    <div id="profilePage">
      {userData &&
        <div id="userInfo">
          <header><h1>Hello, {userData.firstName}!</h1></header>
        </div>}
      <div tw="flex">
        <div tw="">Nav</div>
        <div tw="px-24 border ml-auto">
          <h2>My Schedule</h2>
          <div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage;
