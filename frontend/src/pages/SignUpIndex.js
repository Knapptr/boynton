import { useState, useEffect, useContext } from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import useGetDataOnMount from "../hooks/useGetData";
import tw, { styled } from "twin.macro";
import toTitleCase from "../toTitleCase";
import "styled-components/macro";
import { PopOut, MenuSelector } from "../components/styled";
import cl from "../cl.png";
import UserContext from "../components/UserContext";
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";

const SignUpIndex = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [cabins] = useGetDataOnMount({
		url: "/api/cabins",
		initialState: [],
		optionalSortFunction: (c1, c2) => {
			if ((c1.area = "GA")) {
				return 1;
			} else {
				return -1;
			}
		},
		useToken: true,
	});
	const [weeks] = useGetDataOnMount({
		url: "/api/weeks",
		initialState: [],
		useToken: true,
	});
	const [selected, setSelected] = useState({
		cabin: undefined,
		week: undefined,
	});
	const select = (name, value) => {
		setSelected((s) => ({ ...s, [name]: value }));
	};
	const [showAccordion, setShowAccordion] = useState(false);
	const handleAccordionChange = (e, state) => {
		setShowAccordion(state);
	}

	const handleNewSelection = () => {
		setShowAccordion(false);
	}

	useEffect(() => {
		if (selected.cabin && selected.week) {

			setShowAccordion(false);
			navigate(`/schedule/sign-up/${selected.cabin}/${selected.week}`)
		}
	}, [selected.cabin, selected.week])
	return (
		<>
			{!(weeks.length > 0 && cabins.length > 0) ? (
				<>
					<p>loading...</p>
					<img
						tw="animate-pulse w-1/2 mx-auto"
						src={cl}
						alt="camp leslie"
					/>
				</>
			) : (
				<>
					<Accordion tw="mb-6 shadow-none py-2 px-1 rounded bg-green-200"
						expanded={location.pathname === "/schedule/sign-up" || showAccordion}
						onChange={handleAccordionChange}
					>
						<AccordionSummary
							expandIcon={location.pathname === "/schedule/sign-up" ? <></> : <ExpandMoreIcon />}
						>
							<p tw="text-center w-full font-bold">Sign Up Selection</p>
						</AccordionSummary>
						<AccordionDetails>
							<header tw="my-2">
								<h1>Select Week</h1>
							</header>
							<ul tw="flex gap-1 flex-wrap flex-col">
								{weeks.map((w, wIndex) => (
									<MenuSelector
										tw="p-1 border  cursor-pointer"
										isSelected={w.number === selected.week}
										onClick={() => {
											select("week", w.number);
										}}
									>
										<p>Week {w.number}</p>
										<p tw="italic font-thin">{w.title}</p>
									</MenuSelector>
								))}
							</ul>
							<header>
								<h1>Select Cabin</h1>
							</header>
							<ul tw="flex flex-wrap gap-1 justify-center">
								{cabins.map((c) => (
									<MenuSelector
										tw="p-2 border w-1/5"
										isSelected={c.name === selected.cabin}
										onClick={() => select("cabin", c.name)}
									>
										{c.name}
									</MenuSelector>
								))}
							</ul>
						</AccordionDetails>
					</Accordion>
				</>
			)}
			<Outlet />
		</>
	);
};

export default SignUpIndex;
