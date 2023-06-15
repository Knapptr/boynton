import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const ToggleSelector = ({ list, onChange, selectedItem }) => {
  return (
    <ToggleButtonGroup
      exclusive
      value={selectedItem}
      onChange={(event) => {
        onChange(Number.parseInt(event.target.value));
      }}
    >
      {list.map((item, index) => (
        <ToggleButton key={index} value={index}>
          {item.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};
export default ToggleSelector;
