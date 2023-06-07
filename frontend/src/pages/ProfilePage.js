import { useCallback, useContext, useEffect, useState } from "react";
import UserContext from "../components/UserContext";
import fetchWithToken from "../fetchWithToken";
import tw, { styled } from "twin.macro";
import { Button } from "@mui/material";
import "styled-components/macro";
import { MenuSelector, NavBarLink, StaffBadge } from "../components/styled";


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
        <>
          <div id="userInfo" tw="mb-4">
            <header tw="my-2"><h1 tw="text-3xl font-bold">Hello, {userData.firstName}!</h1></header>

            <ul tw="flex mx-auto w-fit [&>*]:bg-sky-100">
              {userData.firstYear && <StaffBadge firstYear >First Year Staff</StaffBadge>}
              {userData.senior && <StaffBadge senior>Senior Staff</StaffBadge>}
              {userData.lifeguard && <StaffBadge lifeguard >Lifeguard</StaffBadge>}
              {userData.ropes && <StaffBadge ropes >Ropes</StaffBadge>}
              {userData.archery && <StaffBadge archery >Archery</StaffBadge>}
            </ul>
          </div>
          <div tw="flex flex-col sm:flex-row justify-center flex-wrap">
            <div tw="">
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
        <ul tw="flex flex-row flex-wrap gap-2 bg-stone-400 p-4">
          {currentSchedule.map(day => (
            <li><h2 tw="bg-amber-600 font-bold text-white">{day.name}</h2>
              <ul tw="flex flex-col gap-1">
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
