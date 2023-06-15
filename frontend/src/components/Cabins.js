import Cabin from "./Cabin";
import "styled-components/macro";
import {
  Grid,
  Skeleton,
} from "@mui/material";


const Cabins = ({
  showAllLists,
  assign,
  cabinSessions,
  // toggleUnassignModal,
  selectedCampers,
  cabinsOnly,
  unassign,
}) => {
  //const [hideFull, setHideFull] = useState(false);

  const displayCabins = () => {
    let list = [...cabinSessions];
    // if (hideFull) {
    //   list = cabinSessions.filter(
    //     (cabin) => cabin.capacity > cabin.campers.length
    //   );
    // }
    return list.map((cabinSession, index) => {
      return (
        <Grid 
          key={`cabin-${cabinSession.name}`}
        item xs={12} md={4}>
        <Cabin
          cabinsOnly={cabinsOnly}
          assign={assign}
        selectedCampers = {selectedCampers}
          unassignCamper={(camperSessionId) =>
            unassign(camperSessionId, cabinSession.id)
          }
          allOpenState={showAllLists}
          session={cabinSession}
        />
        </Grid>
      );
    });
  };
  return (
    <>
      <Grid container gap={3} justifyContent="center">
        {cabinSessions.length === 0 && <Skeleton variant="rectangular" />}
        {displayCabins()}
      </Grid>
    </>
  );
};

export default Cabins;
