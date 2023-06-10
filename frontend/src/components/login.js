import { useState, useContext } from "react";
import UserContext from "./UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import tw from "twin.macro";
import "styled-components/macro";
import logo from "../cl.png";
import usePops from "../hooks/usePops";
import catchErrors from "../utils/fetchErrorHandling";

const LoginField = tw.input`rounded my-4 border-gray-200 border-2 p-4`;
const SubmitButton = tw.button`bg-green-600 p-4 rounded-lg`;

const Login = () => {
	const auth = useContext(UserContext);
	const [formInputs, setFormInputs] = useState({
		username: "",
		password: "",
	});
	const { PopsBar, shamefulFailure, greatSuccess, clearPops } = usePops()
	const clearPassword = () => {
		setFormInputs(f => ({ ...f, password: "" }))
	}
	const location = useLocation();
	const { cameFrom } = location.state || { cameFrom: null };
	const navigate = useNavigate();
	const handleUpdate = (e) => {
		clearPops();
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
		const result = await fetch("/auth/login", reqOptions);
		const data = await catchErrors(result, (e) => { setFormInputs(f => ({ ...f, password: "" })); shamefulFailure("SHAME!", e.message) });
		if (data) {
			const userData = await data.json();
			auth.logIn(userData.token, userData.user)
			navigate(cameFrom || "/");
		}
	}
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
					required
				/>
				<LoginField
					type="password"
					onChange={handleUpdate}
					required
					name="password"
					id="passwordInput"
					placeholder="password"
					value={formInputs.password}
				/>
				<SubmitButton>Login</SubmitButton>
			</div>
		</form>

			<PopsBar />
		</>
	);
};

export default Login;
