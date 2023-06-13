import { useCallback, useContext, useEffect, useState } from "react";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import AddIcon from "@mui/icons-material/Add";
import fetchWithToken from "../fetchWithToken";
import useGetDataOnMount from "../hooks/useGetData";
import "styled-components/macro";
import {
  MenuSelector,
} from "../components/styled";
import UserContext from "../components/UserContext";
import {
  Autocomplete,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  Stack,
  Button,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
} from "@mui/material";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import HourglassTop from "@mui/icons-material/HourglassTop";

const dayDictionary = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
};

const ProgrammingSchedule = () => {
  const auth = useContext(UserContext);

  const [activities, _, updateActivities] = useGetDataOnMount({
    url: "/api/activities",
    initialState: [],
    useToken: true,
  });

  // get the list of weeks
  const [weeks, setWeeks] = useState([]);
  // selectedWeekId is mainly concerned with the selection menu and UI logic
  const [selectedWeekNumber, setSelectedWeekNumber] = useState(undefined);
  // current Week is data fetched from /api/weeks/:weekid
  const [currentWeek, setCurrentWeek] = useState(undefined);

  const [selectedDayIndex, setSelectedDayIndex] = useState(undefined);

  const selectDay = (dayIndex) => {
    setSelectedDayIndex(dayIndex);
  };

  const getSelectedDay = () => {
    if (!currentWeek) {
      return undefined;
    }
    return currentWeek.days[selectedDayIndex];
  };

  const getWeeks = useCallback(async () => {
    const response = await fetchWithToken("/api/weeks", {}, auth);
    if (!response || response.status !== 200) {
      console.log("Something went wrong!");
      return;
    }
    const data = await response.json();
    setWeeks(data);
  }, [auth]);

  const getWeek = useCallback(
    async (weekNumber) => {
      const response = await fetchWithToken(
        `/api/weeks/${weekNumber}`,
        {},
        auth
      );
      if (!response || response.status !== 200) {
        console.log("Something went wrong!");
        return;
      }
      const data = await response.json();
      setCurrentWeek(data);
    },
    [auth]
  );

  useEffect(() => {
    getWeeks();
  }, [getWeeks]);

  const selectWeek = (weekNumber) => {
    // clear the selected day
    setSelectedDayIndex(undefined);
    // Select for menu
    setSelectedWeekNumber(weekNumber);
    // fetch weeks data
    getWeek(weekNumber);
  };
  const [createActivityData, setCreateActivityData] = useState({
    showWindow: false,
    name: "",
    description: "",
    periodId: null,
  });
  const [selectActivityData, setSelectActivityData] = useState({
    showWindow: false,
    selection: undefined,
    period: undefined,
  });

  const closeCreatePopOut = () => {
    setCreateActivityData((d) => ({ ...d, showWindow: false }));
  };

  const closeAddPopout = () => {
    setSelectActivityData((d) => ({ ...d, showWindow: false }));
  };
  // const openAddPopout = () => {
  //   setSelectActivityData(d => ({ ...d, showWindow: true }));
  // }

  /** Begin the creation of an activity, display a popup with relevant fields.
   * @param periodId {periodId} the period for which to instantiate a session of the newly created activity */
  const beginCreateActivity = (periodId) => {
    // close the select activity window
    closeAddPopout();
    setCreateActivityData({
      showWindow: true,
      name: "",
      description: "",
      periodId,
    });
  };
  /** Begin the creation of an activity session
   * @param periodId {periodId} the period for which to create the session */
  const beginAddActivity = (period) => {
    // openAddPopout();
    setSelectActivityData({
      showWindow: true,
      currentSelection: undefined,
      period,
    });
  };

  /** things to do after creating activity and activity session with activity creator
   */
  const afterActivityCreation = async () => {
    await getWeek(selectedWeekNumber);
    closeCreatePopOut();
    updateActivities();
  };

  const requestAddActivitySession = async (activityId, periodId) => {
    const url = "/api/activity-sessions";
    const data = { activityId, periodId };
    const opts = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    };

    const response = await fetchWithToken(url, opts, auth);
    return response;
  };

  const requestDeleteActivitySession = async (activitySessionId) => {
    const url = `/api/activity-sessions/${activitySessionId}`;
    const opts = { method: "DELETE" };
    const response = await fetchWithToken(url, opts, auth);
    return response;
  };

  const [waitingForDeleteRequest, setWaitingForDeleteRequest] = useState([]);
  const handleDeleteRequest = async (activitySessionId) => {
    setWaitingForDeleteRequest((r) => [...r, activitySessionId]);
    const response = await requestDeleteActivitySession(activitySessionId);
    if (response.status !== 202) {
      console.log("Could not delete activity session");
      return;
    }
    console.log("Deleted activity session");
    await getWeek(selectedWeekNumber);
    setWaitingForDeleteRequest((r) =>
      r.filter((aid) => aid.activitySessionId !== activitySessionId)
    );
  };

  return (
    <>
      <Box width={1}>
    <Typography variant="h5" >Activities</Typography>
    {currentWeek && <Typography variant="h5" fontWeight="bold" >Week {currentWeek.display}</Typography>}
    {<Typography variant="h6" >{dayDictionary[getSelectedDay()?.name]}</Typography>}
        {activities && createActivityData.showWindow && (
          <CreateActivityBox
            open={createActivityData.showWindow}
            data={createActivityData}
            setData={setCreateActivityData}
            close={closeCreatePopOut}
            addActivitySession={requestAddActivitySession}
            afterCreation={afterActivityCreation}
          />
        )}
        { activities && selectActivityData.showWindow && (
          <AddActivityBox
            open={selectActivityData.showWindow}
            activities={activities}
            addActivitySession={requestAddActivitySession}
            week={currentWeek}
            day={currentWeek.days[selectedDayIndex]}
            period={selectActivityData.period}
            close={closeAddPopout}
            createActivity={beginCreateActivity}
            updateWeek={() => getWeek(selectedWeekNumber)}
          />
        )}
        <ul tw="flex justify-center sm:justify-evenly gap-2">
          {weeks.map((week, weekIndex) => {
            return (
              <MenuSelector
                key={`week-select-${week.number}`}
                onClick={() => {
                  selectWeek(week.number);
                }}
                isSelected={
                  selectedWeekNumber && week.number === selectedWeekNumber
                }
              >
                <h2>
                  <span tw="hidden  sm:block">Week</span> {week.number}{" "}
                </h2>
                <span tw="hidden sm:block text-xs font-thin">{week.title}</span>
              </MenuSelector>
            );
          })}
        </ul>
        <ul tw="flex justify-center sm:justify-evenly gap-2">
          {" "}
          {selectedWeekNumber !== undefined &&
            currentWeek &&
            currentWeek.days.map((day, dayIndex) => (
              <MenuSelector
                key={`day-select-${day.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  selectDay(dayIndex);
                }}
                isSelected={getSelectedDay() && day.id === getSelectedDay().id}
              >
                {" "}
                <h3>{day.name}</h3>
              </MenuSelector>
            ))}
        </ul>
        {/* PERIODS */}
        <Grid container spacing={1} alignItems="start">
          {getSelectedDay() !== undefined &&
            getSelectedDay().periods.map((period) => {
              return (
                <Grid key={`period-select-${period.id}`}container item xs={12} sm={6} md={3} justifyContent="center" alignItems="start" spacing={0.5}>
                    <Grid xs={12} component="header" bgcolor="secondary.main">
                      <Typography variant="h6">
                        Act {period.number}
                      </Typography>
                      <IconButton
                        color="success"
                        onClick={() => {
                          beginAddActivity(period);
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Grid>
                  <Grid item xs={11}>
                    <Box
                      bgcolor="primary.light"
                      color="white"
                      py={0.5}
                      mb={0.25}
                      variant="header"
                    >
                      <Typography variant="subtitl2">Activities</Typography>
                    </Box>
                    <List>
                      {period.activities.length === 0 && (
                        <Typography variant="body2">No Activities.</Typography>
                      )}
                      {period.activities.map((activity) => (
                        <ListItem key={`activity-list-${activity.id}`}>
                          <ListItemButton
                            disabled={waitingForDeleteRequest.includes(
                              activity.sessionId
                            )}
                            onClick={() => {
                              if (
                                !waitingForDeleteRequest.includes(
                                  activity.sessinId
                                )
                              ) {
                                handleDeleteRequest(activity.sessionId);
                              }
                            }}
                          >
                            <ListItemText>{activity.name}</ListItemText>
                            <ListItemIcon>
                              {waitingForDeleteRequest.includes(
                                activity.sessionId
                              ) ? (
                                <HourglassTopIcon />
                              ) : (
                                <RemoveCircleIcon />
                              )}
                            </ListItemIcon>
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              );
            })}
        </Grid>
      </Box>
    </>
  );
};

/** @callback activityAdder
 * @param activityId
 * @param periodId
 */
/** Activity box with search bar
 * @param props {Object}
 * @param props.period {period}
 * @param props.day {day}
 * @param props.close function to close popup
 * @param props.addActivitySession {activityAdder}
 * @param props.createActivity called when pressing "create activity"
 * @param props.updateWeek called after creating session
 */
const AddActivityBox = ({
  week,
  period,
  day,
  close,
  open,
  addActivitySession,
  createActivity,
  activities,
  updateWeek,
}) => {
  // get list of activities

  const [activityField, setActivityField] = useState("");

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedActivityId, setSelectedActivityId] = useState("");

  const makeSelection = (e, activity) => {
    console.log({ e, activity });
    // setSelectedActivityId(e.target.value);
    setSelectedActivity(activity);
  };

  const closeAndClear = () => {
    makeSelection({ target: { value: "" } });
    setActivityField("");
    close();
  };

  const handleChange = (e) => {
    setActivityField(e.target.value);
  };

  const handleSubmit = async () => {
    if (selectedActivity !== undefined) {
      const actSessResponse = await addActivitySession(
        selectedActivity.id,
        period.id
      );
      if (actSessResponse.status === 400) {
        closeAndClear();
        const message = await actSessResponse.text();
        console.log(message);
        return;
      }
      console.log({ actSessResponse });
      await updateWeek();
      closeAndClear();
    }
  };
  return (
    <Dialog open={open} onClose={closeAndClear} fullWidth maxWidth="md">
      <Box width={1} px={3}>
        <DialogTitle>
          <Typography variant="subtitle2">
            Week {week.number} <span>{week.title}</span>
          </Typography>
          <Typography variant="h6">
            {" "}
            Add activity to {dayDictionary[day.name]} Act. {period.number}
          </Typography>
        </DialogTitle>

        <Grid container justifyContent="center" alignItems="center">
          <Grid item xs={12} sm={7}>
            <Autocomplete
              fullWidth
              onInputChange={handleChange}
              onChange={makeSelection}
              value={selectedActivity}
              options={activities}
              getOptionLabel={(o) => o.name}
              renderInput={(params) => (
                <TextField {...params} label="Select Activity" />
              )}
            ></Autocomplete>
          </Grid>
          <Grid item xs={12} sm={1}>
            <Typography
              textAlign={{ xs: "left", sm: "center" }}
              fontWeight="bold"
            >
              or
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                createActivity(period.id);
                closeAndClear();
              }}
            >
              Create New
            </Button>
          </Grid>
          {/* Display details selectedActivity && (
            <Box id="infoArea">
              <Typography>
                <span>{selectedActivity.name}</span>
              </Typography>
              <Box>
                <Typography>{selectedActivity.description}</Typography>
              </Box>
            </Box>
          )*/}
        </Grid>
        <DialogActions>
          <Button variant="outlined" color="error" onClick={closeAndClear}>
            Nevermind
          </Button>
          <Button
            variant="contained"
            color="success"
            enabled={selectedActivity !== undefined}
            onClick={handleSubmit}
          >
            Add
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

/** Window for creating an activity
 * @param props {Object}
 * @param props.setData setState for the data*
 * @param props.data {Object}
 * @param props.data.showWindow {boolean} whether to display the popup or not
 * @param props.data.name {string} the name of the new activity
 * @param props.data.description {string} the description of the new activity
 * @param props.data.periodId {number} the Id of the period of which to instantiate a new session of the activity, once it is created
 * @param props.close the function to close the popout window
 * @param props.addActivitySession function that is called after creating a new activity, to automatically create an activity session for the selected period
 * @param props.afterCreation function that is called after all other calls to DB finish
 * */
const CreateActivityBox = ({
  open,
  data,
  setData,
  close,
  addActivitySession,
  afterCreation,
}) => {
  const auth = useContext(UserContext);

  const handleChange = (e) => {
    setData((d) => ({ ...d, [e.target.name]: e.target.value }));
  };

  const createActivity = async () => {
    const act = { name: data.name, description: data.description };
    const url = "/api/activities";
    const options = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(act),
    };

    const result = await fetchWithToken(url, options, auth);
    if (result.status === 400) {
      close();
      const message = await result.text();
      console.log(message);
      return;
    }
    const { id } = await result.json();
    // Create a session for the activity
    await addActivitySession(id, data.periodId);
    afterCreation();
  };

  const isConfirmEnabled = () => {
    if (data.name.length > 0) {
      return true;
    }
    return false;
  };

  return (
    <Dialog open={open} fullWidth maxWidth="md">
      <Box width={1} px={3}>
        <DialogTitle>
          <Typography variant="h6">Create New Activity</Typography>
        </DialogTitle>
        <Stack spacing={1}>
          <TextField
            autoComplete="off"
            id="nameField"
            name="name"
            value={data.name}
            onChange={handleChange}
            label="Activity Name"
          />
          <Divider />
          <TextField
            autoComplete="off"
            id="descriptionField"
            value={data.description}
            onChange={handleChange}
            label="Activity Description"
            minRows={4}
            multiline
            name="description"
          />
        </Stack>
        <DialogActions>
          <Button variant="outlined" color="warning" onClick={close}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={!isConfirmEnabled()}
            onClick={() => {
              if (isConfirmEnabled()) {
                createActivity();
              }
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ProgrammingSchedule;
