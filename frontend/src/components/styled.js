import tw, { styled } from "twin.macro";
import "styled-components/macro";
export const StickyHeader = styled.header(() => [
	tw`sticky items-center top-0 flex justify-between flex-grow md:flex-grow-0 rounded p-2 text-white align-baseline bg-sky-500`,
]);

export const BoyntonHeader = styled.h1(() => [
	tw`text-green-600 p-4 text-5xl font-bold`,
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
