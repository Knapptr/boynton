import tw, { styled } from "twin.macro";
import "styled-components/macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { Chip } from "@mui/material";
export const AssignmentHeader = styled.header(() => [
  tw`sticky top-0 items-center flex justify-between flex-grow md:flex-grow-0 rounded p-2 text-white align-baseline bg-sky-500`,
]);

export const CancelButton = styled.button(() => [tw`bg-red-400 py-2 px-4 rounded`]);
export const ConfirmButton = styled.button(({ enabled, ml }) => [tw`cursor-default bg-gray-400 py-2 px-4 rounded`, enabled && tw`bg-green-400 cursor-pointer`, ml && tw`ml-auto`]);

const NavBarLinkColors = {
  blue: tw`bg-blue-300`,
  green: tw`bg-green-300`,
  red: tw`bg-red-300`,
  purple: tw`bg-purple-300`,
  orange: tw`bg-orange-300`,
  yellow: tw`bg-yellow-300`,
  brown: tw`bg-yellow-600`
};
export const NavBarLink = styled.li(({ color }) => [
  tw` rounded border bg-stone-200 p-2`,
  color && NavBarLinkColors[color],
]);
export const Divider = styled.hr(() => [tw`my-2 flex-grow border-stone-200`]);
export const LabeledDivider = ({ text }) => (
  <div tw="flex justify-center items-center my-1">
    <Divider />
    <h3 tw="mx-3 ">{text}</h3>
    <Divider />
  </div>
);
export const menuColors = {
  red: tw`bg-red-200`,
  blue: tw`bg-blue-200`,
  green: tw`bg-green-200`,
  stone: tw`bg-stone-200`,
  selected: {
    red: tw`bg-red-400`,
    blue: tw`bg-blue-400`,
    green: tw`bg-green-400`,
    stone: tw`bg-green-400`
  },
};
export const MenuSelector = styled.li(({ isSelected, color = "stone" }) => [
  tw`select-none border p-2 rounded cursor-pointer hocus:brightness-95`,
  menuColors[color],
  isSelected && menuColors.selected[color],
]);

export const PopOut = styled.div(({ shouldDisplay }) => [
  tw`hidden h-full flex-col justify-center items-stretch md:items-center fixed top-0 left-0 right-0 z-50 bg-opacity-60 bg-gray-400 `,
  shouldDisplay && tw`flex`,
]);

const DialogBoxBox = styled.div(({ scrollable, full }) => [tw`h-full sm:h-auto w-full bg-coolGray-100 p-5  mt-24 lg:w-8/12 my-4 rounded shadow-lg  relative flex flex-col py-8 `, scrollable && tw`overflow-auto`, full && tw`flex-grow`])

export const DialogBox = ({ close, children, scrollable, full }) => <DialogBoxBox scrollable={scrollable} full={full} onClick={(e) => { e.stopPropagation() }}>

  <button tw="absolute top-1 right-3" onClick={close}><FontAwesomeIcon size="xl" icon={faCircleXmark} /></button>
  {children}</DialogBoxBox>

export const StaffBadge = styled(Chip)(({theme,type, firstYear, senior, ropes, archery, lifeguard }) => ({
  color: theme.palette.badges[type],
  fontWeight: "bold",
}))

export const StaffListing = ({ staffer, fullName, isSelected, removeable, remove, selectable }) => {
  return (
    <div tw="select-none  px-2 py-1 bg-cyan-100 text-xs sm:text-sm rounded-full shadow flex border gap-2 justify-center items-center" css={[isSelected && tw`bg-cyan-700`, selectable && tw`cursor-pointer`]} >
      <h3 tw="">{staffer.firstName} {(fullName && staffer.lastName) || staffer.lastName[0].toUpperCase() + "."}</h3>
      <ul tw="flex gap-2" id={`badges-${staffer.staffSessionId}`}>
        {staffer.firstYear && <StaffBadge firstYear>FY</StaffBadge>}
        {staffer.senior && <StaffBadge senior>SR</StaffBadge>}
        {staffer.lifeguard && <StaffBadge lifeguard >LG</StaffBadge>}
        {staffer.ropes && <StaffBadge ropes >RO</StaffBadge>}
        {staffer.archery && <StaffBadge archery >AR</StaffBadge>}

      </ul>
      {removeable && remove && <button onClick={remove}>X</button>}
    </div >
  )
}
