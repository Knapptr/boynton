import { useState, useContext } from "react";
import UserContext from "./UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import tw from "twin.macro";
import "styled-components/macro";
import logo from "../cl.png";
import { Button } from "@mui/material";
const storeToken = (token) => {
	localStorage.setItem("bearerToken", token);
};

const LoginField = tw.input`rounded my-4 border-gray-200 border-2 p-4`;
const SubmitButton = tw.button`bg-green-600 p-4 rounded-lg`;

const Login = () => {
	const auth = useContext(UserContext);
	const [errors, setErrors] = useState([]);
	const [formInputs, setFormInputs] = useState({
		username: "",
		password: "",
	});
	const clearPassword = () => {
		setFormInputs(f => ({ ...f, password: "" }))
	}
	const clearErrors = () => {
		setErrors([]);
	}
	const location = useLocation();
	const { cameFrom } = location.state || { cameFrom: null };
	const navigate = useNavigate();
	const handleUpdate = (e) => {
		clearErrors();
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
			const error = { text: "Server Error. Tell an admin" }
			clearPassword();
			setErrors(e => [...e, error])
		}
		if (response.status === 400) {
		}
		if (response.status === 401) {
			clearPassword();
			const error = { text: "Incorrect Username or Password" }
			setErrors(e => [...e, error])
		}
		if (response.status === 200) {
			auth.logIn(data.token, data.user)
			// storeToken(data.token);
			navigate(cameFrom || "/");
		}
	};
	return (
		<><form onSubmit={handleSubmit} tw="w-4/5 sm:w-1/2 md:w-2/5 max-w-sm">
			<div tw="flex flex-col">
				<img src={logo} alt="" />
				<LoginField
					type="text"
					name="username"
					id="usernameInput"
					placeholder="username"
					onChange={handleUpdate}
					value={formInputs.username}
				/>
				<LoginField
					type="password"
					onChange={handleUpdate}
					name="password"
					id="passwordInput"
					placeholder="password"
					value={formInputs.password}
				/>
				<SubmitButton>Login</SubmitButton>
			</div>
		</form>

			{errors.length > 0 &&
				<div>
					<ul>{errors.map((e, eIndex) => <li tw="bg-red-400 p-3 rounded m-2 font-bold" key={`error-${eIndex}`}>{e.text}</li>)}</ul>
				</div>
			}
		</>
	);
};

export default Login;
