import { useContext, useState, useEffect, useCallback } from "react";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { MenuSelector, StaffListing } from "../components/styled";
import UserContext from "../components/UserContext";
import fetchWithToken from "../fetchWithToken";
import tw from "twin.macro";
import "styled-components/macro";
import styled from "styled-components";
import WeekContext from "../components/WeekContext";
import { useParams } from "react-router-dom";
import {
    Card,
  Drawer,
  Grid,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Box,Stack } from "@mui/system";
import StaffItem from "../components/StaffItem";

const drawerWidth = 1 / 3;
const topMargin = 8;

const StaffSelectionSources = {
  UNASSIGNED: () => "UNASSIGNED",
  ACTIVITY: (activity) => activity.sessionId,
};
const StaffSchedule = () => {
  const auth = useContext(UserContext);
  const { weekNumber } = useParams();
  const { getWeekByNumber, weeks } = useContext(WeekContext);
  const currentWeek = getWeekByNumber(Number.parseInt(weekNumber));

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const selectedDay = useCallback(() => {
    const currentWeek = getWeekByNumber(Number.parseInt(weekNumber));
    return currentWeek?.days[selectedDayIndex];
  }, [selectedDayIndex, weekNumber, getWeekByNumber]);

  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0);
  const selectedPeriod = useCallback(() => {
    const currentDay = selectedDay();
    return currentDay?.periods[selectedPeriodIndex];
  }, [selectedPeriodIndex, selectedDay]);

  const [viableStaff, setViableStaff] = useState([]);

  const [selectedStaff, setSelectedStaff] = useState([]);

  /** Add all selected staff to activity */
  const addSelectedToActivity = async (activity, activityIndex) => {
    if (
      selectedStaff.length > 0 &&
      selectedStaff.some((s) => s.sourceIndex !== activityIndex)
    ) {
      const url = `/api/activity-sessions/${activity.sessionId}/staff`;
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staff: selectedStaff.map((s) => ({
            staffSessionId: s.staffer.staffSessionId,
          })),
        }),
      };
      //// DO EAGER UPDATE
      eagerUpdateInsertion(selectedStaff, activityIndex);
      // Clear Selection after update
      clearSelectedStaff();
      //// On DB response
      try {
        await fetchWithToken(url, options, auth);
        // Update accordingly
        fetchViableStaff(selectedPeriod());
        fetchActivities();
      } catch (e) {
        console.log("Something went wrong.");
        console.log(e);
      }
    }
  };

  /** Remove individual staff from activity */
  const removeFromActivity = async (sourceIndex, staffer) => {
    clearSelectedStaff();
    const source = activities[sourceIndex];
    const url = `/api/activity-sessions/${source.sessionId}/staff/${staffer.staffActivityId}`;
    const options = {
      method: "DELETE",
    };
    // EAGER UPDATE
    eagerUpdateRemoval(sourceIndex, staffer);
    try {
      // API CALL
      const result = await fetchWithToken(url, options, auth);
      if (!result) {
        throw new Error("Could not delete");
      }
      // Update from DB
      fetchViableStaff(selectedPeriod());
      fetchActivities();
    } catch (e) {
      //TODO handle this case
      console.log("Something went wrong. TODO");
    }
  };
  /** Get unassigned staff for period */
  const fetchViableStaff = useCallback(
    async (period) => {
      const result = await fetchWithToken(
        `/api/staff-sessions/period/${period.id}/viable`,
        {},
        auth
      );
      if (!result) {
        // no viable staff, OR no staff sessions
        console.log("no staff. Handle this");
      }
      const viableStaffAssignments = await result.json();
      setViableStaff(viableStaffAssignments);
    },
    [auth]
  );

  /** Update Staffing UI Eagerly on adding to activity before DB update */
  const eagerUpdateInsertion = (sourceStaffList, destinationIndex) => {
    let newViable = [...viableStaff];
    let newActivities = [...activities];
    for (const { sourceIndex, staffer } of sourceStaffList) {
      if (sourceIndex === destinationIndex) {
        continue;
      }
      // REMOVAL
      //find where the source is coming from update lists accordingly
      //remove from source
      if (sourceIndex === StaffSelectionSources.UNASSIGNED()) {
        newViable = newViable.filter(
          (s) => s.staffSessionId !== staffer.staffSessionId
        );
      } else {
        //copy the list of staff from activity at sourceIndex
        // Uptade at the source Index and remove staff
        let newStaffList = [...newActivities[sourceIndex].staff].filter(
          (s) => s.staffSessionId !== staffer.staffSessionId
        );
        //update activities list
        newActivities[sourceIndex].staff = newStaffList;
      }
      // INSERTION
      const newStaffList = [...newActivities[destinationIndex].staff, staffer];
      // Sort to prevent reordering
      newStaffList.sort((a, b) => a.firstName.localeCompare(b.firstName));
      // update
      newActivities[destinationIndex].staff = newStaffList;
    }

    setActivities(newActivities);
    setViableStaff(newViable);
  };

  /** Eagerly update UI on removal of staff  from activity */
  const eagerUpdateRemoval = (sourceIndex, staffer) => {
    // Removal
    const newActivities = [...activities];
    let newStaffList = [...newActivities[sourceIndex].staff];
    console.log({ before: newStaffList });
    newStaffList = newStaffList.filter(
      (s) => s.staffSessionId !== staffer.staffSessionId
    );
    newActivities[sourceIndex].staff = newStaffList;
    setActivities(newActivities);
    // Insertion
    // sort to avoid reordering
    const newViable = [...viableStaff, staffer];
    newViable.sort((a, b) => a.firstName.localeCompare(b.firstName));
    setViableStaff(newViable);
  };

  const [activities, setActivities] = useState([]);

  //** Clear Activities
  const clearActivities = () => {
    setActivities([]);
  };
  //** Get staff for selected period
  const fetchActivities = useCallback(async () => {
    if (selectedPeriod() !== undefined) {
      const result = await fetchWithToken(
        `/api/periods/${selectedPeriod()?.id}`,
        {},
        auth
      );
      const periodData = await result.json();
      setActivities(periodData.activities);
    }
  }, [auth, selectedPeriod]);

  /** Set assignedstaff on mount */
  useEffect(() => {
    fetchActivities();
    if (selectedPeriod()) {
      fetchViableStaff(selectedPeriod());
    }
  }, [fetchActivities, selectedPeriod, fetchViableStaff]);

  // useEffect(()=>{
  //   fetchActivities()
  // },[weeks,fetchActivities])

  const handleSelectStaff = (sourceIndex, staffer) => {
    if (isSelected(staffer)) {
      setSelectedStaff((st) => st.filter((s) => s.staffer !== staffer));
    } else {
      setSelectedStaff((st) => [...st, { sourceIndex, staffer }]);
    }
  };

  const clearSelectedStaff = () => {
    setSelectedStaff([]);
  };

  const isSelected = (staffer) => {
    return selectedStaff.find((s) => staffer === s.staffer) !== undefined;
  };

  const handleSelectDay = (event) => {
    const dayIndex = event.target.value;
    setSelectedDayIndex(Number.parseInt(dayIndex));
    clearActivities();
    clearSelectedStaff();
    // setSelectedPeriod(null);
    setViableStaff([]);
  };

  const handleSelectPeriod = (event) => {
    clearActivities();
    clearSelectedStaff();
    const periodIndex = Number.parseInt(event.target.value);
    setSelectedPeriodIndex(periodIndex);
    const period = selectedDay()?.periods[periodIndex];
    // setSelectedPeriod(period);
    fetchViableStaff(period);
  };

  return (
    <Box id="DrawerandContent" display="flex" width={1}>
      {/* Staff Goes Here */}
      <Drawer
        variant="permanent"
        sx={{
          zIndex: 0,
          flexShrink: 0,
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "background.primary.light",
          },
        }}
      >
        <Box mb={topMargin} />
     <Card sx={{mb:1}}><Typography variant="h6">{viableStaff.length===0 ? "No Available Staff" :"Available Staff"}</Typography></Card>
        <ViableStaffList
          isSelected={isSelected}
          staff={viableStaff}
          selectStaff={handleSelectStaff}
        />
      </Drawer>

      <Box id="Content" sx={{ flexGrow: 1 }}>
        <Box component="header">
          <Box my={2}>
            {currentWeek && (
              <>
                <Typography variant="h5">Week {currentWeek.display}</Typography>
                <Typography variant="h6">
                  <em>{currentWeek.title}</em>
                </Typography>
              </>
            )}
          </Box>
        </Box>
        <Stack
          mx="auto"
          spacing={2}
          maxWidth={600}
          justifyContent="center"
          alignItems="center"
          direction={{xs:"column",md:"row"}}
        >
          <ToggleButtonGroup
            size="small"
            exclusive
            value={selectedDayIndex}
            onChange={handleSelectDay}
          >
            {currentWeek &&
              currentWeek.days.map((day, dayIndex) => (
                <ToggleButton key={`day-${day.id}`} value={dayIndex}>
                  {day.name}
                </ToggleButton>
              ))}
          </ToggleButtonGroup>

          <ToggleButtonGroup
            size="small"
            exclusive
            value={selectedPeriodIndex}
            onChange={handleSelectPeriod}
          >
            {selectedDay &&
              selectedDay()?.periods.map((p, pIndex) => (
                <ToggleButton value={pIndex} key={`period-${p.id}`}>
                  Act {p.number}
                </ToggleButton>
              ))}
          </ToggleButtonGroup>
        </Stack>
        {activities.length < 1 ? (
          <Typography>No Activities Scheduled</Typography>
        ) : (
          <>
            {/* Acts go Here */}
            <h1>Activities</h1>
            {selectedPeriod() !== undefined && (
              <ActivityStaffList
                remove={removeFromActivity}
                activities={activities}
                isSelected={isSelected}
                selectStaff={handleSelectStaff}
                selectedPeriod={selectedPeriod}
                handleActivityAssignment={addSelectedToActivity}
              />
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

const ViableStaffList = ({ staff, selectStaff, isSelected }) => {
  return (
    <Stack spacing={1}>
      {staff.map((staffer) => (
        <StaffItem
          key={`viable-staff-${staffer.staffSessionId}`}
          isSelected={isSelected(staffer)}
          staffer={staffer}
          handleSelect={() => {
            selectStaff(StaffSelectionSources.UNASSIGNED(), staffer);
          }}
        />
      ))}
    </Stack>
  );
};

const ActivityStaffList = ({
  activities,
  selectStaff,
  isSelected,
  handleActivityAssignment,
  remove,
}) => {
  const auth = useContext(UserContext);

  return (
    <Grid container spacing={{xs:1,sm:2}} >
      {activities.map((activity, activityIndex) => (
        <Grid item xs={12} sm={6}>
          <Box
            bgcolor="background.secondary"
        padding={1}
            onClick={(e) => {
              e.stopPropagation();
              handleActivityAssignment(activity, activityIndex);
            }}
            key={`activity-${activity.sessionId}`}
          >
            <Stack direction="row" width={1} justifyContent="space-around">
              <Typography variant="h6">{activity.name}</Typography>
                <Typography variant="subtitle2">
                  {(activity.staff.length === 0 && "No staff assigned") ||
                    `${activity.staff.length} Assigned`}
                </Typography>
              <Typography variant="h6">
                {activity.campers.length} campers
              </Typography>
            </Stack>
            <Grid container spacing={1}>
              <Grid item component="header" xs={12}>
              </Grid>
              {activity.staff.map((staffer, index) => (
                <Grid
                  item
                  xs={12}
                  key={`activity-staff-${staffer.staffSessionId}`}
                >
                  <StaffItem
                   small
                    staffer={staffer}
                    index={index}
                    isSelected={isSelected(staffer)}
                    handleSelect={(e) => {
                      e.stopPropagation();
                      selectStaff(activityIndex, staffer);
                    }}
                  >
                <IconButton onClick={(e)=>{
                  e.stopPropagation();
                  console.log({activity})
                  remove(activityIndex,staffer)
                }}size="small"><HighlightOffIcon/></IconButton>
                </StaffItem>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default StaffSchedule;
