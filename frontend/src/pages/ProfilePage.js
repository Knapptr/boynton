import { useCallback, useContext, useEffect, useState } from "react";
import UserContext from "../components/UserContext";
import fetchWithToken from "../fetchWithToken";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { MenuSelector, NavBarLink, StaffBadge } from "../components/styled";
import { Link } from "react-router-dom";


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
          <div id="userInfo" tw="pb-24">
            <header><h1>Hello, {userData.firstName}!</h1></header>
            <ul tw="flex mx-auto w-fit [&>*]:bg-sky-100">
              {userData.firstYear && <StaffBadge firstYear >First Year Staff</StaffBadge>}
              {userData.senior && <StaffBadge senior>Senior Staff</StaffBadge>}
              {userData.lifeguard && <StaffBadge lifeguard >Lifeguard</StaffBadge>}
              {userData.ropes && <StaffBadge ropes >Ropes</StaffBadge>}
              {userData.archery && <StaffBadge archery >Archery</StaffBadge>}
            </ul>
          </div>
          <div tw="flex flex-col sm:flex-row justify-center flex-wrap">
            <div tw="w-full sm:w-1/5">
              <ul tw="[&>*]:my-3">
                <NavBarLink color="blue"><Link to="/schedule/attendance">Attendance</Link></NavBarLink>
                <NavBarLink color="green"><Link to="/cabins/list">Cabin Lists</Link></NavBarLink>
                <NavBarLink color="purple"><Link to="/scoreboard">Scores</Link></NavBarLink>
                <NavBarLink color="red"><Link to="/give-award">Give Award</Link></NavBarLink>
                <NavBarLink
                  tw="mt-8"
                  onClick={() => {
                    auth.logOut();
                  }}
                >
                  <button>Log Out</button>
                </NavBarLink>
              </ul>
            </div>
            <div tw="border ml-auto py-2 px-4 w-full mr-auto sm:mr-0 sm:w-1/3">
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
