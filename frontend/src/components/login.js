import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const storeToken = (token) => {
	localStorage.setItem("bearerToken", token);
};

const Login = () => {
	const [formInputs, setFormInputs] = useState({
		username: "",
		password: "",
	});
	const location = useLocation();
	const { cameFrom } = location.state;
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
			storeToken(data.token);
			navigate(cameFrom || "/login");
		}
	};
	return (
		<>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					name="username"
					id="usernameInput"
					placeholder="username"
					onChange={handleUpdate}
				/>
				<input
					type="password"
					onChange={handleUpdate}
					name="password"
					id="passwordInput"
					placeholder="password"
				/>
				<button type="submit">Login</button>
			</form>
		</>
	);
};

export default Login;
