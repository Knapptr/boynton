import CheckedIcon from "@mui/icons-material/TaskAltOutlined";
import { Badge, styled, ToggleButton, ToggleButtonGroup } from "@mui/material";


const ActivityToggleButton = styled(ToggleButton)(({theme,selected,disabled})=>( {
  backgroundColor: theme.palette.primary.main,
  '&:hover': {backgroundColor: theme.palette.primary.light},
  color:"white",
  '&.Mui-selected':{
    backgroundColor: theme.palette.secondary.main,
    color: "white"
  },
  '&.Mui-selected:hover':{
    backgroundColor: theme.palette.secondary.main,
    color: "white"
  },

} ))

const ActivitySelectors = ({
  openSearchModal,
  getTotalUnaccounted,
  selectAll,
  selectSpecific,
  period,
  displayAll,
  selected,
}) => {
  const isSelected = (activity) => {
    if (selected === null) {
      return false;
    }
    const selectedAct = period.activities[selected];
    return selectedAct.sessionId === activity.sessionId;
  };
  return (
    <>
    <Badge badgeContent={getTotalUnaccounted()||<CheckedIcon fontSize="inherit" />} color={getTotalUnaccounted()===0?"success":"error"} anchorOrigin={{vertical:"top",horizontal:"left"}} >
    <ToggleButtonGroup exclusive size="small" >
    <ActivityToggleButton  value="all" onClick={selectAll} selected={displayAll}>
    All
    </ActivityToggleButton>
      {period.activities.map((act, index) => (
        <ActivityToggleButton

        value={index}
          onClick={() => {
            selectSpecific(index);
          }}
          selected={isSelected(act)}
          key={`act-select-${act.sessionId}`}
        >
          {act.name}
        </ActivityToggleButton>
      ))}
    </ToggleButtonGroup>
    </Badge>
    </>
  );
};

export default ActivitySelectors;
