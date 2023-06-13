import useActivityAttendance from "../hooks/useActivityAttendance";
import { useContext, useEffect } from "react";
import lodash from "lodash";
import { postCampersToActivity } from "../requests/activity";
import toTitleCase from "../toTitleCase";
import UserContext from "./UserContext";
import {
  Box,
  Container,
  Chip,
  Drawer,
  Grid,
  Skeleton,
  Stack,
  styled,
  Typography,
  Alert,
} from "@mui/material";

const drawerWidth = 175;
const ActivityList = styled(Box)(({ bg, theme }) => ({
  backgroundColor: bg
    ? theme.palette.background[bg]
    : theme.palette.background.secondary,
  borderRadius: "2%",
}));

const SelectActivities = ({
  periodId,
  cabinName,
  selectedCampers,
  handleSelectCamper,
  clearSelection,
}) => {
  const {
    loading: activitiesLoading,
    activityLists,
    setLists,
    refresh,
  } = useActivityAttendance(periodId, cabinName);

  const auth = useContext(UserContext);

  const handleSubmit = async (activitySessionId) => {
    if (
      selectedCampers.length > 0 &&
      selectedCampers.some((c) => c.sourceId !== activitySessionId)
    ) {
      const campersToAdd = [...selectedCampers];
      try {
        const response = await postCampersToActivity(
          campersToAdd.map((c) => c.camper),
          activitySessionId,
          auth
        );
      } catch (e) {
        console.log("Something went wrong assigning campers to db", e);
        refresh();
      }
      // Eagerly update UI
      let newState = lodash.cloneDeep(activityLists);
      for (const selectedCamper of campersToAdd) {
        // Remove camper from source
        newState[selectedCamper.sourceId].campers = newState[
          selectedCamper.sourceId
        ].campers.filter(
          (c) => c.camperSessionId !== selectedCamper.camper.camperSessionId
        );
        // Add camper to destination
        newState[activitySessionId].campers.push(selectedCamper.camper);
      }
      // update state
      clearSelection();
      setLists(newState);
    }
  };
  const dropZoneSize=(activityId)=>{
     switch (activityLists[activityId].campers.length){
      case 0:
         return 4;
      case 1: 
         return 2;
      case 2:
         return 1;
      default:
       return 0;
    }
  }

  return (
    <>
      <Box width={1} display="flex">
        {/* CAMPERS */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            zIndex: 0,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
                <Box mb={20}/>
    {activityLists.unassigned && activityLists.unassigned.campers.length === 0 &&
      <Box px={0.75}>
      <Alert severity="success" variant="filled">All Campers Assigned!</Alert>
      </Box>
    }
    {activityLists.unassigned &&
              activityLists.unassigned.campers.length > 0 && (
                <Box px={0.75}>
                    <Box position="sticky" top={0} component="header">
                      <Typography variant="subtitle1" fontWeight="bold">Unassigned</Typography>
                    </Box>
                <Stack direction="column" spacing={1}>
                    {activityLists.unassigned &&
                      [...activityLists.unassigned.campers]
                        .sort((a, b) => a.lastName.localeCompare(b.lastName))
                        .map((camper, index) => (
                                <Chip
                            onClick={(e)=>{
                              e.stopPropagation()
                              handleSelectCamper(camper,"unassigned")
                            }

                            }
                            color={selectedCampers.some(sc=>sc.camper.camperSessionId === camper.camperSessionId)?"primary":"default"}

                                  label={`${camper.firstName} ${camper.lastName} ${camper.age}`}
                                />
                        /*<CamperItem
                            selectable
                            camper={camper}
                            key={`unassigned-camper-${camper.camperSessionId}`}
                            isSelected={selectedCampers.some(
                              (sc) =>
                                sc.camper.camperSessionId ===
                                camper.camperSessionId
                            )}
                            handleSelect={() =>
                              handleSelectCamper(camper, "unassigned")
                            }
                          ></CamperItem>*/
                        ))}
                          </Stack>
                </Box>
              )}
    </Drawer>
        <Grid container justifyContent="center">
          {activitiesLoading ? (
            <Box>
              <Skeleton
                animation="wave"
                variant="rectangular"
                height={400}
                width={350}
              />
              <Skeleton
                animation="wave"
                variant="rectangular"
                height={400}
                width={350}
              />
            </Box>
          ) : (
            <>
              {/* ACTIVITIES */}
            
              <Stack width={1} maxWidth={666} spacing={2} pl={0.33} alignItems="stretch" py={1} >
                {activityLists.activityIds &&
                  activityLists.activityIds.map((aid, index) => (
                    <ActivityList
                      px={1}
                      width={1}
                      key={`activity-list-${aid}`}
                      onClick={() => {
                        handleSubmit(aid);
                      }}
                    >
                      <Box component="header" mb={1}>
                        <Typography fontWeight="bold" variant="subtitle1">
                          {toTitleCase(activityLists[aid].name)}
                        </Typography>
                      </Box>
                      {/* Alphabetize here, so that ui updates are consistant*/}
                    <Container maxWidth="sm" >
                      <Stack spacing={1} >
                        {[...activityLists[aid].campers]
                          .sort((a, b) => a.lastName.localeCompare(b.lastName))
                          .map((camper, index) => (
                            <>
                                <Chip
                            onClick={(e)=>{
                              e.stopPropagation()
                              handleSelectCamper(camper,aid)
                            }

                            }
                            color={selectedCampers.some(sc=>sc.camper.camperSessionId === camper.camperSessionId)?"primary":"default"}

                                  label={`${camper.firstName} ${camper.lastName}`}
                                />
                              {/*<CamperItem
                            selectable
                            index={index}
                            camper={camper}
                            isSelected={selectedCampers.some(
                              (sc) =>
                                sc.camper.camperSessionId ===
                                camper.camperSessionId
                            )}
                            key={`camper-assingment-${camper.camperSessionId}`}
                            handleSelect={(e) => {
                              e.stopPropagation();
                              handleSelectCamper(camper, aid);
                            }}
                          ></CamperItem>*/}
                            </>
                          ))}
                      </Stack>
                    </Container>
                    <Box id={`${aid}-dropzone`} py={dropZoneSize(aid)} ></Box>
                    </ActivityList>
                  ))}
              </Stack>
              {/*
              )*/}
            </>
          )}
        </Grid>
      </Box>
    </>
  );
};

export default SelectActivities;
