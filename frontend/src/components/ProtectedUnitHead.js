import { useContext } from "react";
import UserContext from './UserContext';
import { Navigate, useLocation } from "react-router-dom";

const UnitHeadAccess = ({ children }) => {
	const auth = useContext(UserContext)
	const location = useLocation();
	const hasToken = () => {
		const token = auth.userData.token
		return token ? true : false;
	};
	if (!hasToken()) {
		return <Navigate to="/login" state={{ cameFrom: location.pathname }} />;
	} else {
		if (auth.userData.user.role !== "admin" && auth.userData.user.role !== "unit_head") {
			return <Navigate to="/" />;
		}
		return children;
	}
};

export default UnitHeadAccess;
