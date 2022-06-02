import { useEffect } from "react";
import { useNavigate, Route, Navigate, useLocation } from "react-router-dom";

const Protected = ({ children, path, element }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const hasToken = () => {
		const token = localStorage.getItem("bearerToken");
		return token ? true : false;
	};
	if (!hasToken()) {
		return <Navigate to="/login" state={{ cameFrom: location.pathname }} />;
	} else {
		return children;
	}
};

export default Protected;
