import { useCallback, useContext, useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UserContext from "../components/UserContext";
import fetchWithToken from "../fetchWithToken";
import tw, { styled } from "twin.macro";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, Dialog, DialogContent, DialogTitle, Divider, Fab, Fade, FormControl, FormGroup, List, ListItem, ListItemText, MenuItem, Paper, ScopedCssBaseline, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import "styled-components/macro";
import { CancelButton, ConfirmButton, MenuSelector, NavBarLink, StaffBadge } from "../components/styled";
import useWeeks from "../hooks/useWeeks";


const AddScoreDialog = ({ onClose, show, week }) => {
  const TEAMS = ["Naumkeag", "Tahattawan"];
  const auth = useContext(UserContext);

  const fetchAddPoints = async () => {
    const reqBody = { ...fields, weekNumber: week.number }
    const url = "/api/scores";
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody)
    }
    const response = await fetchWithToken(url, options, auth)
    const data = await response.json();
  }

  const handleSubmit = async () => {
    await fetchAddPoints();
    handleClose();
  }

  const initFields = { awardedFor: "", awardedTo: TEAMS[0], points: 0 }
  const [fields, setFields] = useState(initFields)

  const handleChange = (e) => {
    setFields(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const allFieldsFilled = () => {
    return fields.awardedFor.trim().length > 0 && fields.points > 0 && fields.awardedTo.trim().length > 0
  }
  const handleClose = () => {
    onClose();
    setFields(initFields);
  }

  return (week && <Dialog onClose={handleClose} open={show}>
    <DialogTitle>Award Points: Week {week.display}</DialogTitle>
    <DialogContent>

      <Box component="form" autoComplete="off">
        <FormControl>
          <Stack direction="row" paddingY={2} gap={2}>
            <TextField tw="min-w-[10rem]" value={fields.awardedTo} onChange={handleChange} name="awardedTo" id="outlined-basic" label="Team" variant="outlined" select

            >
              {TEAMS.map(team => <MenuItem value={team} key={`team-select-${team}`}>{team}</MenuItem>)}
            </TextField>

            <TextField name="points" value={fields.points} onChange={handleChange} inputProps={{ min: 1 }} id="outlined-basic" label="Points" type="number" variant="outlined" />

          </Stack>
          <div tw="w-full">
            <TextField tw="w-full" name="awardedFor" value={fields.awardedFor} onChange={handleChange} id="outlined-basic" label="Reason" variant="outlined" />
          </div>
        </FormControl>
      </Box>
      <Box display="flex" justifyContent="space-around" marginY={2}>
        <CancelButton onClick={handleClose}>Cancel</CancelButton>
        <ConfirmButton
          enabled={allFieldsFilled()}
          onClick={() => { if (allFieldsFilled()) { handleSubmit() } }}>
          Score!
        </ConfirmButton>
      </Box>
    </DialogContent>

  </Dialog >)
}
const ScorePane = () => {
  const auth = useContext(UserContext);
  const [scores, setScores] = useState(null);
  const { weeks, DaySelection, selectedWeek, WeekSelection, PeriodSelection } = useWeeks();

  const getScore = useCallback(async (weekNumber) => {
    const url = `/api/weeks/${weekNumber}/scores`;
    const scoresResp = await fetchWithToken(url, {}, auth);
    const data = await scoresResp.json();
    setScores(data);
  }, [auth])

  useEffect(() => {
    if (selectedWeek()) {
      getScore(selectedWeek().number);
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

  const [showAdd, setShowAdd] = useState(false);
  const handleOpen = () => {
    setShowAdd(true);
  }
  const handleClose = () => {
    setShowAdd(false);
  }
  return (
    <>
      <Box>
        <Card>
          <Typography variant="h5" component="h4">2023 Scoreboard</Typography>
          <Stack direction="row" alignItems="center" paddingX={2} marginBottom={1}>
            <WeekSelection />
            {/*Clashing MUI and Twin.macro wont allow for a 'Fab' (MUI) here as far as I can tell*/}
            <button onClick={selectedWeek() && handleOpen} css={[tw`cursor-default bg-gray-100 rounded-full p-4 text-white ml-auto`, selectedWeek() && tw`cursor-pointer bg-green-600 hover:bg-green-800`]}><AddIcon /></button>

          </Stack>
          <AddScoreDialog show={showAdd} onClose={() => {
            getScore(selectedWeek().number);
            handleClose();
          }} week={selectedWeek()} />
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
      </Box >
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
    <div id="profilePage" tw="w-full py-4 px-2 bg-coolGray-200">
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
          <div tw="flex gap-3 flex-col md:flex-row  ">
            <div tw="w-full md:w-3/5">
              <UserSchedule user={userData} sessions={userData.sessions} />
            </div>
            <div tw="w-full md:w-2/5">
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

  const handleSessionSelect = (e, value) => {
    setSelectedSession(value)
  }

  useEffect(() => {
    console.log({ selectedSession });
    if (selectedSession !== null) {
      const fetchSelected = async () => {
        const url = `/api/users/${user.username}/schedule/${selectedSession}`
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
      <Box>
        <Card>
          <Typography variant="h5" component="h4">My Schedule</Typography>
          <ToggleButtonGroup
            exclusive
            onChange={handleSessionSelect}
            value={selectedSession}
          >
            {sessions.map(session => (
              <ToggleButton
                key={`session-select-${session.weekNumber}}`}
                value={session.weekNumber}
              >
                Week {session.weekNumber}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          {currentSchedule &&
            <Fade in={currentSchedule}>
              <ul tw="flex flex-row flex-wrap gap-2 bg-green-800 p-4">
                {currentSchedule.map(day => (
                  <li tw="w-full">
                    <TableContainer component={Paper}>
                      <header><Typography variant="h5" component="h6">{day.name}</Typography></header>
                      <Table>
                        <TableHead>
                          <TableRow>
                            {day.periods.map(p => <TableCell>Act {p.number}</TableCell>)}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            {day.periods.map(p => <TableCell>{p.activityName}</TableCell>)}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </li>
                ))}
              </ul>
            </Fade>
          }
        </Card>
      </Box>
    </>
  )
}

export default ProfilePage;
