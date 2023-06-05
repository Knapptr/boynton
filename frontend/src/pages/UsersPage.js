import fetchWithToken from "../fetchWithToken"
import UserContext from "../components/UserContext"
import { useCallback, useContext, useEffect, useState } from "react";
import { DialogBox, PopOut } from "../components/styled";
import tw from "twin.macro";
import "styled-components/macro";

const EditUserBox = ({ weeks, user, edits, editType, handleChange, closePopOut, onConfirm }) => {
  const [showStaffing, setShowStaffing] = useState(false);
  return (

    <DialogBox close={closePopOut} >
      {user !== null && <>
        <header><h1>Editing {user.username}</h1></header>
        <span> Hey, Note that if you change the name of the currently logged in user, you will have to log in again</span>
        <div tw="flex flex-col items-center justify-center h-full py-8">
          <div tw="">
            <label htmlFor={`usernameField-${editType}`}>Username</label>
            <input name="username" id={`usernameField-${editType}`} onChange={handleChange} value={edits.username} />
          </div>
          <div>
            <label htmlFor={`firstNameField-${editType} `}>First Name</label>
            <input id={`firstNameField-${editType} `} name="firstName" onChange={handleChange} value={edits.firstName} />
          </div>
          <div>
            <label htmlFor={`lastNameField-${editType}`}>Last Name</label>
            <input id={`lastNameField-${editType}`} name="lastName" onChange={handleChange} value={edits.lastName} />
          </div>
          <div>
            <label htmlFor={`roleSelection-${editType} `}>Role</label>
            <select id={`roleSelection-${editType}`} name="role" value={edits.role} onChange={handleChange}>
              <option value="admin" >Admin</option>
              <option value="counselor" >Counselor</option>
              <option value="unit_head" >Unit Head</option>
              <option value="programming" >Programming</option>
            </select>
          </div>
          {editType === editTypes.CREATE &&
            <div>
              <label htmlFor="passwordField">Password</label>
              <input name="password" id="passwordField" type="password" value={edits.password} onChange={handleChange} />
            </div>
          }
          <div>
            <label htmlFor="lifeguardField">Lifeguard</label>
            <input type="checkbox" id="lifeguardField" name="lifeguard" onChange={handleChange} checked={edits.lifeguard || false} />
            <label htmlFor="archeryField">Archery</label>
            <input type="checkbox" id="archeryField" name="archery" onChange={handleChange} checked={edits.archery || false} />
            <label htmlFor="seniorField">Senior Staff</label>
            <input type="checkbox" id="seniorField" name="senior" onChange={handleChange} checked={edits.senior || false} />
            <label htmlFor="ropesField">Ropes</label>
            <input type="checkbox" id="ropesField" name="ropes" onChange={handleChange} checked={edits.ropes || false} />
            <label htmlFor="firstYearField">First Year</label>
            <input type="checkbox" id="firstYearField" name="firstYear" onChange={handleChange} checked={edits.firstYear || false} />
          </div>
          <div>
            <ul>
              {weeks.map(week => (
                <li key={`week-check-${week.number}`}>
                  <label htmlFor={`session-${week.number}`}>Week {week.number}</label>
                  <input type="checkbox" name={`SESSION-${week.number}`} id={`session-${week.number}`} onChange={handleChange} checked={edits.sessions.some(ss => ss.weekNumber === week.number)} /></li>
              ))}
            </ul>
          </div>
          <footer tw="py-4"> </footer>
          <div tw="absolute bottom-4 flex justify-center flex-wrap gap-4">
            <button tw="bg-red-400 py-2 px-4 rounded" onClick={closePopOut}>Cancel</button>
            <button tw="bg-green-400 py-2 px-4 rounded" onClick={onConfirm}>Confirm</button>
          </div>
        </div>

      </>
      }
    </DialogBox>
  )
}
const editTypes = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  NONE: "NONE",
}

const UsersPage = () => {
  const auth = useContext(UserContext);

  const [users, setUsers] = useState([]);

  const [edit, setEdit] = useState({ type: editTypes.NONE, user: null, edits: null, })

  const [weeks, setWeeks] = useState([]);

  const handleChange = (event) => {
    // parse if checkbox and map data appropriately
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value
    if (event.target.name.startsWith("SESSION-")) {
      const weekNumber = Number.parseInt(event.target.name.split("-")[1]);
      setEdit((oldEdit) => {
        let updatedSessions = [...oldEdit.edits.sessions];
        if (value) {
          updatedSessions.push({ weekNumber })
        } else {
          updatedSessions = updatedSessions.filter(s => s.weekNumber !== weekNumber);
        }
        return { ...oldEdit, edits: { ...oldEdit.edits, sessions: updatedSessions } }
      })
    } else {
      setEdit((oldEdit) => ({ ...oldEdit, edits: { ...oldEdit.edits, [event.target.name]: value } }))
    }
  }
  const toggleUpdatePopOut = (user) => {
    const edits = {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      lifeguard: user.lifeguard,
      archery: user.archery,
      ropes: user.ropes,
      firstYear: user.firstYear,
      senior: user.senior,
      sessions: user.sessions
    }
    setEdit(e => ({ edits: edits, user, type: editTypes.UPDATE }));
  }
  const closePopOut = () => {
    setEdit(e => ({ edits: null, user: null, type: editTypes.NONE }))
  }

  const toggleDeletePopOut = (user) => {
    setEdit({ user, type: editTypes.DELETE });
  }

  const toggleCreateNew = () => {
    const initEdits = { username: "", firstName: "", lastName: "", role: "counselor", password: "", lifeguard: false, archery: false, firstYear: false, ropes: false, sessions: [] }
    const initUser = { ...initEdits, username: "New User" };
    setEdit({ type: editTypes.CREATE, edits: initEdits, user: initUser });
  }

  /**Submit New User 
  */
  const submitNew = async () => {
    const url = "/api/users"
    const user = { ...edit.edits }
    const opts = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(user)
    }
    try {
      const response = await fetchWithToken(url, opts, auth);
      // TODO handle incorrect args etc
      if (response.status !== 201) { const err = await response.text(); throw new Error(err) }
      console.log("Submitted New User");
      getUsers();
      closePopOut();
    } catch (e) {
      console.log("Error:", e);
    }
  }

  /**Delete User */
  const deleteUser = async () => {
    const url = `/api/users/${edit.user.username}`;
    const opts = {
      method: "DELETE",
    }
    try {
      const response = await fetchWithToken(url, opts, auth);
      // TODO handle incorrect args etc
      if (response.status !== 200) { const err = await response.text(); throw new Error(err) }
      console.log("Deleted User");
      getUsers();
      closePopOut();
    } catch (e) {
      console.log("Error:", e);
    }
  }

  /**UpdateUser */
  const updateUser = async () => {
    const url = `/api/users/${edit.user.username}`;
    const opts = {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(edit.edits)
    }
    try {
      const response = await fetchWithToken(url, opts, auth);
      // TODO handle incorrect args etc
      if (response.status !== 200) { const err = await response.text(); throw new Error(err) }
      console.log("Updated User");
      getUsers();
      closePopOut();
    } catch (e) {
      console.log("Error:", e);
    }
  }

  const getUsers = useCallback(async () => {
    const usersResponse = await fetchWithToken("/api/users", {}, auth);
    const users = await usersResponse.json();
    setUsers(users);
  }, [auth])

  const getWeeks = useCallback(async () => {
    const weekResponse = await fetchWithToken("/api/weeks", {}, auth);
    const weeks = await weekResponse.json();
    setWeeks(weeks);
  }, [auth])

  // Get users and weeks on load
  useEffect(() => {
    getUsers();
    getWeeks();
  }, [getUsers, getWeeks])

  return (
    <>
      <h1>Users</h1>
      {edit.type === editTypes.UPDATE && weeks &&
        <PopOut shouldDisplay={true} onClick={closePopOut}>
          <EditUserBox weeks={weeks} user={edit.user} edits={edit.edits} closePopOut={closePopOut} handleChange={handleChange} onConfirm={updateUser} />
        </PopOut>
      }
      {edit.type === editTypes.CREATE && weeks &&
        <PopOut shouldDisplay={true} onClick={closePopOut}>
          <EditUserBox weeks={weeks} editType={editTypes.CREATE} user={edit.user} edits={edit.edits} closePopOut={closePopOut} handleChange={handleChange} onConfirm={submitNew} />
        </PopOut>
      }
      {edit.type === editTypes.DELETE &&
        <PopOut shouldDisplay={true} onClick={closePopOut}>
          <DialogBox close={closePopOut}>
            <header>
              <h1>Delete {edit.user.username}?</h1>
            </header>
            <div tw="flex w-full h-full justify-center items-center py-4">
              <p>Are you sure you wish to delete {edit.user.firstName} {edit.user.lastName}'s account?</p>
            </div>
            <footer tw="py-4"> </footer>
            <div tw="absolute bottom-4 flex justify-center w-full">
              <button onClick={deleteUser}>DELETE</button>
              <button onClick={closePopOut}>cancel</button>
            </div>
          </DialogBox>
        </PopOut>
      }
      <button onClick={toggleCreateNew}> Create</button>
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
            <tr tw="even:bg-green-300 odd:bg-green-100" key={`user-table-${u.username}`}>
              <td tw="font-bold">{u.username}</td>
              <td>{u.firstName}</td>
              <td>{u.lastName}</td>
              <td >{u.role}</td>
              <td><button onClick={() => toggleUpdatePopOut(u)}>Edit</button></td>
              <td><button onClick={() => toggleDeletePopOut(u)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default UsersPage
