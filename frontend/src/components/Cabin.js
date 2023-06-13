import Camper from "./Camper";
import DoNotDisturbAltOutlinedIcon from '@mui/icons-material/DoNotDisturbAltOutlined';
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import { useState, useEffect } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "styled-components/macro";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  Card,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { Button } from "@mui/base";
import CamperItem from "./CamperItem";
import DoNotDisturbAltOutlined from "@mui/icons-material/DoNotDisturbAltOutlined";

const Cabin = ({
  assign,
  session,
  allOpenState,
  unassignCamper,
  selectedCampers,
  cabinsOnly,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => {
    setIsOpen((o) => !o);
  };

  useEffect(() => {
    setIsOpen(allOpenState);
  }, [allOpenState]);

  /** Get min and max ages in cabin, ignoring FLs */
  const getMinMaxAge = () => {
    if (session.campers.every((c) => c.fl)) {
      return { min: "FL", max: "ONLY" };
    }
    // Cabins are sorted by age in the response, so iterate through until a non FL is found on each end
    let i = 0;
    let j = session.campers.length - 1;

    while (i < session.campers.length && session.campers[i].fl) {
      i++;
    }
    while (j > 0 && session.campers[j].fl) {
      j--;
    }
    if (j < 0) {
      return { min: session.campers[0].age, max: session.campers[0].age };
    }
    return { min: session.campers[i].age, max: session.campers[j].age };
  };

  const [openList,setOpenList] = useState(false);

  useEffect(()=>{
    if(openList && session.campers.length === 0){setOpenList(false)}
  },[session.campers])
  return (
    <Card width={1}>
      <Box
        disabled={session.campers.length === session.capacity}
        onClick={(e) => {
          e.stopPropagation();
          // if (list.length === session.capacity) {
          //   console.log("Cabin is full.");
          // } else {
          assign(session, session.campers.length);
          //}
        }}
      >
        <Stack
          direction="row"
          component="header"
    justifyContent="space-between"
    align-items="center"
          sx={{
            py: 1,
            px: { xs: 4, md: 2 },
            backgroundColor: "secondary.main",
            color: "white",
          }}
        >
    <Box>
          <Typography variant="h5">{session.name}</Typography>
    </Box>
    <Box>
    {session.campers.length === session.capacity && <Typography ml={1} variant="subtitle1" fontWeight="bold">full</Typography>}
    </Box>
    <Box ml="auto">
          <Typography color="lightgrey" >
            <Typography color="white" fontWeight="bold">
              {session.campers.length}
            </Typography>
            /{session.capacity}
          </Typography>
    </Box>
        </Stack>

        <Accordion
          expanded={openList}
          disabled={session.campers.length === 0}
          onChange={(e) => {
            setOpenList(t=>!t);
            e.stopPropagation();
          }}
        >
          <AccordionSummary
            expandIcon={session.campers.length > 0 && <ExpandMoreIcon />}
          >
            <Typography>
              {session.campers.length <= 0
                ? "Empty"
                : `Ages: ${getMinMaxAge().min} - ${getMinMaxAge().max}`}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack>
              {session.campers.map((camper, index) => {
                return (
                  <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                      "&:nth-child(odd)": {
                        backgroundColor: "background.main",
                      },
                      "&:nth-child(even)": {
                        backgroundColor: "background.alt",
                      },
                    }}
                  >
                    <CamperItem camper={camper}>
                      <IconButton
                        onClick={() => {
                          unassignCamper(camper.id);
                        }}
                        size="small"
                        sx={{ ml: "auto" }}
                      >
                        <PersonRemoveIcon />
                      </IconButton>
                    </CamperItem>
                  </Stack>
                  /*<Grid container>
                    <Grid item xs={9}>
                      <Stack direction="row">
                        <Typography>
                          {camper.firstName} {camper.lastName}
                        </Typography>
                        <Typography>{camper.age}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={3}>
                      <PersonRemoveIcon />
                    </Grid>
                  <Grid item xs={12}>

                  </Grid>
                  </Grid>*/
                );
              })}
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Card>
  );
};

{
  /*<Camper
                    cabinName={session.name}
                    selectable={false}
                    full
                    removable
                    unassignCamper={unassignCamper}
                    key={`camper-${camper.id}`}
                    camper={camper}
                    index={index}
                  /> */
}
export default Cabin;
