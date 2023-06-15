import { Chip, styled } from "@mui/material";

export const StaffBadge = styled(Chip)(({theme,type, firstYear, senior, ropes, archery, lifeguard }) => ({
  color: theme.palette.badges[type],
  fontWeight: "bold",
}))

