import fetchWithToken from "../fetchWithToken"
import UserContext from "../components/UserContext"
import { useContext, useEffect, useState } from "react";
import tw from "twin.macro";
import "styled-components/macro";

const UsersPage = () => {
  const auth = useContext(UserContext);
  const [users, setUsers] = useState([]);

  // Get users on load
  useEffect(() => {
    const getUsers = async () => {
      const usersResponse = await fetchWithToken("/api/users", {}, auth);
      const users = await usersResponse.json();
      setUsers(users);

    }
    getUsers();
  }, [auth])
  return (
    <>
      <h1>Users</h1>
      <ul tw="">
        {users.map(u => (
          <li tw="even:bg-green-300 odd:bg-green-100 flex my-2 "><p tw="font-bold mx-1">{u.username}</p><p>({u.firstName} {u.lastName})</p><p tw="mx-1">{u.role}</p></li>
        ))}
      </ul>
    </>
  )
}

export default UsersPage
