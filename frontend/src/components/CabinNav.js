import { MenuSelector } from "./styled";
import { Link } from "react-router-dom";
import tw, { styled } from "twin.macro";
import "styled-components/macro";

const CabinNav = ({ cabins, currentCabin, weekNumber }) => {
	return (
		<nav>
			<ul tw="flex justify-start flex-wrap gap-1">
				{cabins.map((cabinLink, index) => {
					return (
						<Link
							to={`../sign-up/${cabinLink.cabinName}/${weekNumber}`}
							key={`cabin-link-${index}`}
							tw="w-[10%]"
						>
							<MenuSelector
								color="blue"
								isSelected={
									cabinLink.cabinName === currentCabin
								}
							>
								{cabinLink.cabinName}
							</MenuSelector>
						</Link>
					);
				})}
			</ul>
		</nav>
	);
};

export default CabinNav;
