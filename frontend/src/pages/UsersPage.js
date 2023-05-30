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
      <table tw="table-auto w-full">
        <thead>
          <tr>
            <td>Username</td>
            <td>First Name</td>
            <td>Last Name</td>
            <td>Role</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr tw="even:bg-green-300 odd:bg-green-100">
              <td tw="font-bold">{u.username}</td>
              <td>{u.firstName}</td>
              <td>{u.lastName}</td>
              <td >{u.role}</td>
              <td><button>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default UsersPage
