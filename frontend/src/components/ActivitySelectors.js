import tw from "twin.macro";
import "styled-components/macro";
import { MenuSelector } from "./styled";
import { Stack } from "@mui/system";
import { Divider, styled, ToggleButton, ToggleButtonGroup } from "@mui/material";

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
    <ToggleButtonGroup exclusive >
    <ActivityToggleButton value="all" onClick={selectAll} selected={displayAll}>All</ActivityToggleButton>
      {period.activities.map((act, index) => (
        <>
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
        </>
      ))}
    </ToggleButtonGroup>
  );
};

export default ActivitySelectors;
