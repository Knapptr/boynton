import { useCallback, useContext, useEffect, useState } from "react";
import UserContext from "../components/UserContext";
import fetchWithToken from "../fetchWithToken";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { MenuSelector } from "../components/styled";


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
        <><div id="userInfo">
          <header><h1>Hello, {userData.firstName}!</h1></header>
        </div>
          <div tw="flex">
            <div tw="">Nav</div>
            <div tw="border ml-auto py-2 px-4 w-1/3">
              <UserSchedule user={userData} sessions={userData.sessions} />
              <div>

              </div>
            </div>
          </div></>
      }
    </div>
  )
}

const UserSchedule = ({ sessions, user }) => {
  const auth = useContext(UserContext);
  const [selectedSession, setSelectedSession] = useState(null);
  const [currentSchedule, setCurrentSchedule] = useState(null);

  const selectSession = (session) => {
    setSelectedSession(session);
  }

  useEffect(() => {
    if (selectedSession !== null) {
      const fetchSelected = async () => {
        const url = `/api/users/${user.username}/schedule/${selectedSession.weekNumber}`
        const results = await fetchWithToken(url, {}, auth);
        if (results.status !== 200 && results.status !== 304) { console.log("Error handling needed profile schedule"); return; }
        const data = await results.json();
        setCurrentSchedule(data);
      }
      fetchSelected();
    }
  }, [selectedSession, auth, user])

  return (
    <>
      <h1>My Schedule</h1>
      <ul id="sessionSelect" tw="flex gap-1">
        {sessions.map(session => (
          <MenuSelector isSelected={selectedSession && selectedSession.id === session.id} onClick={() => { selectSession(session) }} >Week {session.weekNumber}</MenuSelector>
        ))}
      </ul>
      {currentSchedule &&
        <ul  >
          {currentSchedule.map(day => (
            <li><h2 tw="bg-amber-600 font-bold text-white">{day.name}</h2>
              <ul>
                {day.periods.map(p => (
                  <li tw="even:bg-sky-200 odd:bg-sky-100 flex gap-2 p-1"><h3>Act {p.number}</h3><p tw="font-bold">{p.activityName}</p></li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      }
    </>
  )
}

export default ProfilePage;
