import { Box, Chip, Divider, Stack, Typography } from "@mui/material";

const stafferBadges = (staffer) => {
  const badges = [
    { type: "senior", has: staffer.senior, label: "SR" },
    { type: "firstYear", has: staffer.firstYear, label: "FY" },
    { type: "lifeguard", has: staffer.lifeguard, label: "LG" },
    { type: "ropes", has: staffer.ropes, label: "RO" },
    { type: "archery", has: staffer.archery, label: "AR" },
  ];

  return badges.filter((b) => b.has);
};

export const StaffItem = ({
  staffer,
  index,
  small,
  handleSelect,
  isSelected,
  children,
}) => {
  return (
    <Box
      onClick={handleSelect}
      sx={{
        backgroundColor: isSelected
          ? "primary.main"
          : small
          ? "secondary.light"
          : index % 2 === 0
          ? "background.paper"
          : "background.alt",
        color: isSelected ? "white" : "black",
        opacity: small && 0.8,
        borderRadius: small && "5%",
        padding: small && 1,
      }}
      width={1}
      py={0.75}
      px={1}
      textAlign="left"
      key={`staff-${staffer.id}`}
    >
      <Stack direction="row" flexWrap="wrap" alignItems="center">
        <Stack
          direction={small ? "row" : "column"}
          flexWrap="wrap"
          spacing={0.5}
    alignItems={small&&"center"}
        >
          <Typography variant="subtitle2">
            {staffer.firstName} {staffer.lastName[0]}
          </Typography>
          <Stack
            direction="row"
            justifyContent="start"
            spacing={0.2}
            flexWrap="wrap"
            sx={{
              display: { xs: small && "none", md: "block" },
            }}
          >
            {stafferBadges(staffer).map((badge) => (
              <Chip color="teal" size="small" label={badge.label} />
            ))}
          </Stack>
        </Stack>
        {children}
      </Stack>
    </Box>
  );
};

export default StaffItem;
