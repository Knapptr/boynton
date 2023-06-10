import { useCallback, useContext, useEffect, useState } from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UserContext from "../components/UserContext";
import fetchWithToken from "../fetchWithToken";
import tw, { styled } from "twin.macro";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, Divider, List, ListItem, ListItemText, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import "styled-components/macro";
import { MenuSelector, NavBarLink, StaffBadge } from "../components/styled";
import useWeeks from "../hooks/useWeeks";


const ScorePane = () => {
  const auth = useContext(UserContext);
  const [scores, setScores] = useState(null);
  const { weeks, selectedWeek, WeekSelection } = useWeeks();

  const getScore = useCallback(async (weekNumber) => {
    const url = `/api/weeks/${weekNumber}/scores`;
    const scoresResp = await fetchWithToken(url, {}, auth);
    const data = await scoresResp.json();
    setScores(data);
  }, [auth])

  useEffect(() => {
    if (selectedWeek) {
      getScore(selectedWeek.number);
    }
  }, [selectedWeek, getScore])

  const scoreRows = () => {
    if (!scores) { return false }
    const teams = scores.summerTotals.map(d => d.team);
    const data = teams.map(team => {

      const summerCol = scores.summerTotals.find(d => d.team === team);
      const summerTotal = (summerCol && summerCol.total) || 0

      const weekCol = scores.weekTotals.find(d => d.team === team);
      const weekTotal = (weekCol && weekCol.total) || 0
      return {
        team: team,
        summerTotal,
        weekTotal
      }
    })
    return data;
  }

  return (
    <>
      <Box>
        <Card>
          <Typography variant="h5" component="h4">Score Board</Typography>
          <WeekSelection labelElement={<Typography variant="p" component="h5" marginX={2}>Week</Typography>} />
          {!scores && <Skeleton variant="rectangular" animation={false} height={400} />}
          {scores &&
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Team</TableCell>
                      <TableCell align="right">Week {}</TableCell>
                      <TableCell align="right">All Summer</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scoreRows().map((row) => (
                      <TableRow key={`team-row-${row.team}`} >
                        <TableCell component="th" scope="row">
                          {row.team}
                        </TableCell>
                        <TableCell align="right">{row.weekTotal}</TableCell>
                        <TableCell align="right">{row.summerTotal}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Week Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer tw="w-full max-h-32">
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Team</TableCell>
                          <TableCell>Points</TableCell>
                          <TableCell>Day</TableCell>
                          <TableCell>Reason</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {scores.events.map((event, index) => (
                          <TableRow key={`event-${index}`}>
                            <TableCell>
                              {event.team}
                            </TableCell>
                            <TableCell>
                              {event.points}
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" component={"span"}>{event.day}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" component={"span"}>{event.for}</Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </>
          }
        </Card>
      </Box>
    </>
  )
}
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
    <div id="profilePage" tw="w-full">
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
          <div tw="grid grid-cols-1 gap-1 sm:grid-cols-2">
            <UserSchedule user={userData} sessions={userData.sessions} />
            <div>
              <ScorePane />
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
      <div>
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
      </div>
    </>
  )
}

export default ProfilePage;
