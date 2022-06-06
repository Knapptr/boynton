import { useState,useContext } from "react";
import UserContext from "./UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import tw from "twin.macro";
import "styled-components/macro";
import logo from "../cl.png";
const storeToken = (token) => {
	localStorage.setItem("bearerToken", token);
};

const LoginField = tw.input`rounded my-4 border-gray-200 border-2 p-4`;
const SubmitButton = tw.button`bg-green-400 p-4 rounded-lg`;

const Login = () => {
    const auth = useContext(UserContext);
	const [formInputs, setFormInputs] = useState({
		username: "",
		password: "",
	});
	const location = useLocation();
	const { cameFrom } = location.state || { cameFrom: null };
	const navigate = useNavigate();
	const handleUpdate = (e) => {
		const field = e.target.name;
		const value = e.target.value;
		setFormInputs((f) => {
			return {
				...f,
				[field]: value,
			};
		});
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		const reqOptions = {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				username: formInputs.username,
				password: formInputs.password,
			}),
		};
		const response = await fetch("/auth/login", reqOptions);
		const data = await response.json();
		if (response.status === 500) {
			console.log({ data });
		}
		if (response.status === 400) {
			console.log({ data });
		}
		if (response.status === 401) {
			console.log({ data });
		}
		if (response.status === 200) {
            auth.logIn(data.token,{})
			// storeToken(data.token);
			navigate(cameFrom || "/");
		}
	};
	return (
		<form onSubmit={handleSubmit} tw="w-4/5 sm:w-1/2 md:w-2/5 max-w-sm">
			<div tw="flex flex-col">
				<img src={logo} alt="" />
				<LoginField
					type="text"
					name="username"
					id="usernameInput"
					placeholder="username"
					onChange={handleUpdate}
				/>
				<LoginField
					type="password"
					onChange={handleUpdate}
					name="password"
					id="passwordInput"
					placeholder="password"
				/>
				<SubmitButton type="submit">Login</SubmitButton>
			</div>
		</form>
	);
};

export default Login;
