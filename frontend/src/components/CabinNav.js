import { MenuSelector } from "./styled";
import { Link } from "react-router-dom";
import { useState } from "react";
import tw, { styled } from "twin.macro";
import "styled-components/macro";
import toTitleCase from "../toTitleCase";

const CabinNav = ({ cabins, currentCabin, weekNumber }) => {
	return (
		<ul tw="flex justify-center md:justify-start flex-wrap gap-1">
			{cabins.map((cabinLink, index) => {
				return (
					<Link
						to={`../sign-up/${cabinLink.name}/${weekNumber}`}
						key={`cabin-link-${index}`}
						tw="w-1/4 md:w-[10%]"
					>
						<MenuSelector
							color="blue"
							isSelected={cabinLink.name === currentCabin}
						>
							{toTitleCase(cabinLink.name)}
						</MenuSelector>
					</Link>
				);
			})}
		</ul>
	);
};

export default CabinNav;
