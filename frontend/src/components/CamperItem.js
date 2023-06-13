import { Box, Chip, Divider, Stack, Typography } from "@mui/material";

export const CamperItem = ({ camper,divider,index, selectable, handleSelect,isSelected, children}) => {
  console.log({camper})
  const camperBadges = (camper) => {
    const badges = [
      { type: "dayCamp", label: "day" },
      { type: "fl", label: "FL" },
      { type: "pronouns", label: camper.pronouns },
    ];

    const activeBadges = badges.filter((badge) => camper[badge.type]);
    return activeBadges;
  };
  return (
    <Box
    onClick={handleSelect}
      sx={{
        backgroundColor: selectable && isSelected ? "primary.main":index % 2 === 0 ? "background.paper" : "background.alt",
        color: selectable && isSelected ? "white" : "black"
      }}
    width={1}
      py={0.75}
      px={1}
      textAlign="left"
      key={`camper-${camper.id}`}
    >
    <Stack direction="row">
    <Stack direction= "column">
      <Typography>
        {camper.firstName} {camper.lastName} <em>{camper.age}</em>
      </Typography>
      <Stack direction="row" justifyContent="start">
        {camperBadges(camper).map((badge) => (
          <Chip size="small" label={badge.label} />
        ))}
    </Stack>
      </Stack>
    {divider &&<Divider variant="inset" />}
    {children}
    </Stack>
    </Box>
  );
};

export default CamperItem;
