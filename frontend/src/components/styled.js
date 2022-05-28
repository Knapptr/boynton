import tw, { styled } from "twin.macro";

export const StickyHeader = styled.header(() => [
	tw`sticky items-center top-0 flex justify-between flex-grow md:flex-grow-0 rounded p-2 text-white align-baseline bg-sky-500`,
]);
