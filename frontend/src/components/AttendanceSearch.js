import { useEffect, useRef, useState } from "react";
import getDayName from "../utils/getDayname";
import { Box, Dialog, Button, ListItemText, TextField, Typography, Stack } from "@mui/material";

const AttendanceSearch = ({
  shouldDisplay,
  activities,
  closeSearchModal,
  period,
}) => {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);


  useEffect(() => {
    if (query === "") {
      setResults([]);
      return;
    }
    const searchTerm = query.toUpperCase();
    const newResults = activities.reduce((activityAcc, activityCv) => {
      const campers = activityCv.campers.reduce((camperAcc, camperCv) => {
        if (camperCv.firstName.toUpperCase().includes(searchTerm.toUpperCase()) || camperCv.lastName.toUpperCase().includes(searchTerm.toUpperCase())) {
          camperAcc.push({ activityName: activityCv.name, ...camperCv })
        }
        return camperAcc
      }, [])
      activityAcc = [...activityAcc, ...campers];
      return activityAcc;
    }, []);
    setResults(newResults);
  }, [query, activities]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };
  return (
    <Dialog open={shouldDisplay} onClose={closeSearchModal} maxWidth="sm" fullWidth   >
      <Box
        display="flex"
        flexDirection="column"
        py={4}
        px={2}
      >
        <Box component="header" sx={{ w: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <Typography variant="h6" component="h2">Week {period.weekNumber} {getDayName(period.dayName)}</Typography>
          <Typography variant="h5" component="h3">Act {period.number} Camper Search</Typography>
        </Box>
        <TextField
          placeholder="Enter Camper Name"
          onChange={handleChange}
          value={query}
          name="camperSearch"
        />
        <Box backgroundColor="primary.main" my={2} height={300} minWidth={200} id="resultsBox" flexDirection="column" overflow="scroll" display="flex">
          <Stack spacing={1} padding={1}>
            {results.length === 0 &&
              <Box>
                <ListItemText primary="No campers found :(" />
              </Box>}
            {results.map((camper, index) => {
              return (
                <Stack paddingX={2} paddingY={1} direction="row" backgroundColor="background.paper" justifyContent="space-between">
                  <Box>
                    <Typography variant="p" component="h4">{camper.firstName} {camper.lastName} </Typography>
                    <Typography variant="p" sx={{ fontStyle: "italic" }}>{camper.age}</Typography>
                  </Box>
                  <Box display="flex">
                    <Typography variant="p" component="h4" sx={{ marginTop: "auto" }}>{camper.activityName || "Unassigned"}</Typography>
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        </Box>
        <Button color="warning" variant="outlined" onClick={closeSearchModal}>Close Search</Button>
      </Box>
    </Dialog >
  );
};

export default AttendanceSearch;
