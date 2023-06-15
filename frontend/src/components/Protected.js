import { useContext} from "react";
import UserContext from './UserContext';
import { Navigate} from "react-router-dom";

const Protected = ({ children}) => {
    const auth = useContext(UserContext) 
	const hasToken = () => {
		const token = auth.userData.token 
		return token ? true : false;
	};
	if (!hasToken()) {
		return <Navigate to="/login" state={{ cameFrom: "/" }} />;
	} else {
		return children;
	}
};

export default Protected;
