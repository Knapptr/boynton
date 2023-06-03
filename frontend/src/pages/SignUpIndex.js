import { useState, useEffect, useContext } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import useGetDataOnMount from "../hooks/useGetData";
import tw, { styled } from "twin.macro";
import toTitleCase from "../toTitleCase";
import "styled-components/macro";
import { PopOut, MenuSelector } from "../components/styled";
import cl from "../cl.png";
import UserContext from "../components/UserContext";
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

const SignUpIndex = () => {
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
					<header tw="my-2">
						<h1>Select Week</h1>
					</header>
					{selected.cabin && selected.week && (
						<PopOut
							shouldDisplay={true}
							onClick={() => {
								setSelected({
									cabin: undefined,
									week: undefined,
								});
							}}
						>
							<div tw=" relative flex flex-col justify-center border bg-stone-300 max-w-md shadow-2xl rounded-lg px-4 py-2 w-10/12">
								<button
									tw="self-end mr-2 absolute top-0 text-gray-500"
									onClick={() => {
										setSelected({
											cabin: undefined,
											week: undefined,
										});
									}}
								>
									<FontAwesomeIcon icon={faCircleXmark} />
								</button>
								<header tw="text-xl">
									<h1 tw="text-base">Sign-Up</h1>
									<h2>Cabin {toTitleCase(selected.cabin)}</h2>
									<p tw="text-base font-light">for</p>{" "}
									<h2>Week {selected.week}?</h2>
								</header>
								<div tw="flex justify-center w-10/12 mx-auto mt-3">
									<Link
										tw="bg-green-300 rounded border border-stone-800 py-1 px-6"
										to={`${selected.cabin}/${selected.week}`}
									>
										Go!
									</Link>
								</div>
							</div>
						</PopOut>
					)}
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
				</>
			)}
		</>
	);
};

export default SignUpIndex;
