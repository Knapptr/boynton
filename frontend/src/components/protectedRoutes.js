import { useContext } from "react";
import UserContext from './UserContext';
import { useNavigate, Route, Navigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const hasToken = () => {
    const token = auth.userData.token
    return token ? true : false;
  };
  if (!hasToken()) {
    return <Navigate to="/login" state={{ cameFrom: location.pathname }} />;
  } else {
    if (!roleAuth(role)(auth)) {
      return <Navigate to="/login" state={{ cameFrom: location.pathname }} />;
    }
    return children;
  }
}

export default RoleProtected
