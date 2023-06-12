import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleDot,
  faCircle,
  faSquare,
  faSquareCheck,
} from "@fortawesome/free-regular-svg-icons";
import { Alert, Typography, Box, Grid, Stack, Chip, Divider } from "@mui/material";
import { styled } from "@mui/material/styles"

const AttendantWrapper = styled(Box)(({ theme, children, isSelected, isChecked, index }) => ({
  backgroundColor: isChecked ? theme.palette.primary.main : index % 2 === 0 ? theme.palette.background.paper : theme.palette.background.alt,
  marginTop: 3,
  color: isChecked ? "white" : "black",
  fontWeight: "bold"


}))

export const AttendanceSummary = ({ icon, allHere, clearText, unaccountedText }) => {
  return <Alert icon={icon} padding={1} variant="filled" severity={allHere ? "success" : "error"} ><Typography variant="p" fontWeight={allHere ? "regular" : "bold"} borderRadius={2 / 1} color={allHere ? "white" : "black"}>{allHere ? clearText : unaccountedText}</Typography></Alert>
}

const CamperAttendant = ({
  camperIndex,
  camper,
  activity,
  toggleIsPresent,
  camperSelection,
}) => {
  const assignHere = async () => {
    toggleIsPresent(activity.sessionId, camper.sessionId);
    const options = {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${localStorage.getItem("bearerToken")}`,
      },
      body: JSON.stringify({ isPresent: !camper.isPresent }),
    };
    await fetch(`/api/camper-activities/${camper.activityId}/attendance`, options);
  };

  return (
    <AttendantWrapper
      index={camperIndex}
      isChecked={camper.isPresent}
      isSelected={camperSelection.isSelected(camper)}
    >
      <Box>
        <Box mr="auto">
          <button
            onClick={() => {
              if (camperSelection.isSelected(camper)) {
                camperSelection.deselect(camper);
                return;
              }
              camperSelection.select(camper);
            }}
          >
            {camperSelection.isSelected(camper) ? (
              <FontAwesomeIcon icon={faCircleDot} />
            ) : (
              <FontAwesomeIcon icon={faCircle} />
            )}
          </button>
        </Box>
        <Box>
          <p>
            {camper.firstName} {camper.lastName}
          </p>
          <span >Cabin {camper.cabinName}</span>
        </Box>
        {/* This is a BUTTON and should be changed up */}
        <div isPresent={camper.isPresent} onClick={assignHere}>
          {camper.isPresent && (
            <FontAwesomeIcon size="xl" icon={faSquareCheck} />
          )}
          {!camper.isPresent && <FontAwesomeIcon size="xl" icon={faSquare} />}
        </div>
      </Box>
    </AttendantWrapper>
  );
};

const ActivityAttendance = ({
  activity,
  activityIndex,
  toggleHere,
  camperSelection,
}) => {
  const getUnaccountedFor = () => {
    const unaccounted = activity.campers.filter(
      (camper) => camper.isPresent === false || camper.activityName === null
    );
    return unaccounted.length;
  };
  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Box component="header" backgroundColor="secondary.main" p={1} position="sticky" top={72} width={1} zIndex={100}>
          <Box>
            <Box id="titleInfo">
              <Stack direction="row" color="white" alignItems="baseline" justifyContent="space-between" pr={4}>
                <Typography variant="h6">
                  {activity.name}
                </Typography>
                <Typography variant="subtitle1">
                  {activity.campers.length}
                </Typography>
              </Stack>
            </Box>
            <Box >
              <AttendanceSummary clearText="All Here" unaccountedText={`${getUnaccountedFor()} Unaccounted`} allHere={getUnaccountedFor() === 0} />
            </Box>
            <Box mt={1}>
              <Grid container >
                {activity.staff.map(staffer =>
                  <Grid item xs={4}>
                    <Chip
                      label={`${staffer.firstName} ${staffer.lastName[0]}`}
                      size="small"
                      color="primary"
                      key={`staff-chip-${staffer.id}`} />
                  </Grid>
                )}</Grid>
            </Box>
          </Box>
        </Box>
        {/* Camper Info */}
        <Box width={11 / 12} >
          <Stack>
            {activity.campers.length === 0 ? (

              <Box> <Typography>No Campers</Typography></Box>
            ) : (
              [...activity.campers]
                .sort((camper1, camper2) => camper1.lastName.localeCompare(camper2.lastName)
                )
                .map((camper, camperIndex) => (
                  <CamperAttendant
                    camperSelection={camperSelection}
                    key={`camper-${activity.name}-${camper.sessionId}`}
                    toggleIsPresent={toggleHere}
                    camperIndex={camperIndex}
                    camper={camper}
                    activityIndex={activityIndex}
                    activity={activity}
                  ></CamperAttendant>
                ))
            )}
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default ActivityAttendance;
