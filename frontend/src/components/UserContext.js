import { createContext, useState } from "react";

const hasData = () => {
    return localStorage.getItem('bearerToken') && localStorage.getItem('user')
}
export const getUser = () => {
    if (hasData()) {
        const token = localStorage.getItem("bearerToken");
        const user = JSON.parse(localStorage.getItem("user") || {});
        return { token, user }
    }
    return { token: false, user: false }
}


const UserContext = createContext(getUser());

export const useUserData = () => {
    const [userData, setUserData] = useState(getUser());
    const logOut = () => {
        localStorage.removeItem("user")
        localStorage.removeItem("bearerToken")
        setUserData({ user: null, token: null })
    }
    const logIn = (token, userData) => {
        localStorage.setItem("bearerToken", token)
        localStorage.setItem('user', JSON.stringify(userData))
        setUserData(getUser())
    }
    return { logIn, logOut, userData }
}

export default UserContext;
