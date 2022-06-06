import { useContext} from "react";
import UserContext from './UserContext';
import { useNavigate, Route, Navigate, useLocation } from "react-router-dom";

const Protected = ({ children, path, element }) => {
    const auth = useContext(UserContext) 
	const location = useLocation();
	const navigate = useNavigate();
	const hasToken = () => {
		const token = auth.userData.token 
		return token ? true : false;
	};
	if (!hasToken()) {
		return <Navigate to="/login" state={{ cameFrom: location.pathname }} />;
	} else {
		return children;
	}
};

export default Protected;
