import tw, { styled } from "twin.macro";
import "styled-components/macro";
export const AssignmentHeader = styled.header(() => [
	tw`sticky top-0 items-center flex justify-between flex-grow md:flex-grow-0 rounded p-2 text-white align-baseline bg-sky-500`,
]);

const NavBarLinkColors = {
	blue: tw`bg-blue-300`,
	green: tw`bg-green-300`,
	red: tw`bg-red-300`,
	purple: tw`bg-purple-300`,
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
};
export const MenuSelector = styled.li(({ isSelected, color = "green" }) => [
	tw`border p-2 rounded bg-stone-200`,
	isSelected && menuColors[color],
]);

export const PopOut = styled.div(({ shouldDisplay }) => [
	tw`hidden h-full flex-col justify-center items-center fixed top-0 left-0 right-0 z-50 bg-opacity-60 bg-gray-400 `,
	shouldDisplay && tw`flex`,
]);
