import { useContext} from "react";
import UserContext from './UserContext';
import { useNavigate, Route, Navigate, useLocation } from "react-router-dom";

const UnitHeadAccess= ({ children, path, element }) => {
    const auth = useContext(UserContext) 
  console.log({auth});
	const location = useLocation();
	const navigate = useNavigate();
	const hasToken = () => {
		const token = auth.userData.token 
		return token ? true : false;
	};
	if (!hasToken() ) {
		return <Navigate to="/login" state={{ cameFrom: location.pathname }} />;
	} else {
    if(auth.userData.user.role !== "admin" && auth.userData.user.role !== "unitHead"){
      return <Navigate to="/" />;
    }
		return children;
	}
};

export default UnitHeadAccess;
