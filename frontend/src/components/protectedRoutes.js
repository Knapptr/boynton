import { useContext } from "react";
import UserContext from './UserContext';
import {Navigate /*useLocation*/ } from "react-router-dom";
import { isAdmin, isProgramming, isUnitHead } from "../utils/permissions";


const roleAuth = (role) => {
  const dict = {
    admin: isAdmin,
    unit_head: isUnitHead,
    programming: isProgramming,
    counselor: () => true
  }
  return dict[role]
}
const RoleProtected = ({ role, children }) => {
  const auth = useContext(UserContext)
  // const location = useLocation();
  const hasToken = () => {
    const token = auth.userData.token
    return token ? true : false;
  };
  if (!hasToken()) {
    return <Navigate to="/login" state={{ cameFrom: "/" }} />;
  } else {
    if (!roleAuth(role)(auth)) {
      return <Navigate to="/login" state={{ cameFrom: "/" }} />;
    }
    return children;
  }
}

export default RoleProtected
