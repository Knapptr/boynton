import fetchWithToken from "../fetchWithToken";
import UserContext from "../components/UserContext";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  Dialog,
  Stack,
  DialogTitle,
  TextField,
  Paper,
  InputLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  DialogActions,
  Typography,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import useWeeks from "../hooks/useWeeks";
import { AddCircle, DeleteSharp, Edit } from "@mui/icons-material";

const ROLES = ["counselor", "programming", "unit_head", "admin"];

const initEdits = {
  username: "",
  firstName: "",
  lastName: "",
  role: "counselor",
  password: "",
  lifeguard: false,
  archery: false,
  firstYear: false,
  ropes: false,
  sessions: [],
};

const EditUserBox = ({
  open,
  weeks,
  user,
  edits,
  editType,
  handleChange,
  closePopOut,
  onConfirm,
}) => {
  return (
    <Dialog onClose={closePopOut} open={open}>
      {user !== null && (
        <Box px={2}>
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold" color="primary">
              Editing {user?.username}
            </Typography>
          </DialogTitle>
          <Typography variant="caption">
            Hey, Note that if you change the name of the currently logged in
            user, you will have to log in again
          </Typography>
          <Stack mt={1} spacing={1}>
            <Box width={5 / 8}>
              <TextField
                color="primary"
                label="Username"
                name="username"
                id={`usernameField-${editType}`}
                onChange={handleChange}
                value={edits.username}
              />
            </Box>
            <Stack direction="row" spacing={1}>
              <TextField
                id={`firstNameField-${editType} `}
                name="firstName"
                label="First Name"
                onChange={handleChange}
                value={edits.firstName}
              />
              <TextField
                color="primary"
                label="Last Name"
                name="lastName"
                id={`lastNameField-${editType}`}
                onChange={handleChange}
                value={edits.lastName}
              />
            </Stack>
            <Box width={5 / 8}>
              <FormControl fullWidth onChange={handleChange}>
                <InputLabel>Role</InputLabel>
                <Select label="Role" value={edits.role}>
                  {ROLES.map((role) => (
                    <MenuItem value={role}>{role}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {editType === editTypes.CREATE && (
              <Box width={5 / 8}>
                <TextField
                  name="password"
                  label="password"
                  id="passwordField"
                  type="password"
                  value={edits.password}
                  onChange={handleChange}
                />
              </Box>
            )}
            <Box width={1}>
              <FormGroup row variant="compact" onChange={handleChange}>
                <FormControlLabel
                  labelPlacement="top"
                  control={<Checkbox checked={edits.senior} name="senior" />}
                  label="Senior Staff"
                />
                <FormControlLabel
                  labelPlacement="top"
                  control={
                    <Checkbox checked={edits.firstYear} name="firstYear" />
                  }
                  label="First Year Staff"
                />
                <FormControlLabel
                  labelPlacement="top"
                  control={
                    <Checkbox checked={edits.lifeguard} name="lifeguard" />
                  }
                  label="Lifeguard"
                />
                <FormControlLabel
                  labelPlacement="top"
                  control={<Checkbox checked={edits.archery} name="archery" />}
                  label="Archery"
                />
                <FormControlLabel
                  labelPlacement="top"
                  control={<Checkbox checked={edits.ropes} name="ropes" />}
                  label="Ropes"
                />
              </FormGroup>
            </Box>
            <Box width={1}>
              <FormGroup row onChange={handleChange}>
                {weeks.map((week) => (
                  <FormControlLabel
                    key={`week-check-${week.number}`}
                    labelPlacement="top"
                    control={
                      <Checkbox
                        checked={edits.sessions.some(
                          (ss) => ss.weekNumber === week.number
                        )}
                        name={`SESSION-${week.number}`}
                      />
                    }
                    label={`Week ${week.display}`}
                  />
                ))}
              </FormGroup>
            </Box>
            <DialogActions>
              <Stack direction="row" spacing={2}>
                <Button
                  color="warning"
                  variant="outlined"
                  onClick={closePopOut}
                >
                  Cancel
                </Button>
                <Button color="success" variant="contained" onClick={onConfirm}>
                  Confirm
                </Button>
              </Stack>
            </DialogActions>
          </Stack>
        </Box>
      )}
    </Dialog>
  );
};
const editTypes = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  NONE: "NONE",
};

const UsersPage = () => {
  const auth = useContext(UserContext);

  const [users, setUsers] = useState([]);

  const [edit, setEdit] = useState({
    type: editTypes.NONE,
    user: undefined,
    edits: initEdits,
  });

  const { weeks } = useWeeks();

  const handleChange = (event) => {
    // parse if checkbox and map data appropriately
    console.log({ event });
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    if (event.target.name.startsWith("SESSION-")) {
      const weekNumber = Number.parseInt(event.target.name.split("-")[1]);
      setEdit((oldEdit) => {
        let updatedSessions = [...oldEdit.edits.sessions];
        if (value) {
          updatedSessions.push({ weekNumber });
        } else {
          updatedSessions = updatedSessions.filter(
            (s) => s.weekNumber !== weekNumber
          );
        }
        return {
          ...oldEdit,
          edits: { ...oldEdit.edits, sessions: updatedSessions },
        };
      });
    } else {
      setEdit((oldEdit) => ({
        ...oldEdit,
        edits: { ...oldEdit.edits, [event.target.name]: value },
      }));
    }
  };
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
      sessions: user.sessions,
    };
    setEdit((e) => ({ edits: edits, user, type: editTypes.UPDATE }));
  };
  const closePopOut = () => {
    setEdit((e) => ({ edits: initEdits, user: null, type: editTypes.NONE }));
  };

  const toggleDeletePopOut = (user) => {
    setEdit({ user, edits: initEdits, type: editTypes.DELETE });
  };

  const toggleCreateNew = () => {
    const initUser = { ...initEdits, username: "New User" };
    setEdit({ type: editTypes.CREATE, edits: initEdits, user: initUser });
  };

  /**Submit New User
   */
  const submitNew = async () => {
    const url = "/api/users";
    const user = { ...edit.edits };
    const opts = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(user),
    };
    try {
      const response = await fetchWithToken(url, opts, auth);
      // TODO handle incorrect args etc
      if (response.status !== 201) {
        const err = await response.text();
        throw new Error(err);
      }
      console.log("Submitted New User");
      getUsers();
      closePopOut();
    } catch (e) {
      console.log("Error:", e);
    }
  };

  /**Delete User */
  const deleteUser = async () => {
    const url = `/api/users/${edit.user?.username}`;
    const opts = {
      method: "DELETE",
    };
    try {
      const response = await fetchWithToken(url, opts, auth);
      // TODO handle incorrect args etc
      if (response.status !== 200) {
        const err = await response.text();
        throw new Error(err);
      }
      console.log("Deleted User");
      getUsers();
      closePopOut();
    } catch (e) {
      console.log("Error:", e);
    }
  };

  /**UpdateUser */
  const updateUser = async () => {
    const url = `/api/users/${edit.user?.username}`;
    const opts = {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(edit.edits),
    };
    try {
      const response = await fetchWithToken(url, opts, auth);
      // TODO handle incorrect args etc
      if (response.status !== 200) {
        const err = await response.text();
        throw new Error(err);
      }
      console.log("Updated User");
      getUsers();
      closePopOut();
    } catch (e) {
      console.log("Error:", e);
    }
  };

  const getUsers = useCallback(async () => {
    const usersResponse = await fetchWithToken("/api/users", {}, auth);
    const users = await usersResponse.json();
    setUsers(users);
  }, [auth]);

  // Get users on load
  useEffect(() => {
    getUsers();
  }, [getUsers]);

  return (
    <>
      <h1>Users</h1>
      {weeks && (
        <>
          <EditUserBox
            open={
              edit.type !== editTypes.NONE && edit.type !== editTypes.DELETE
            }
            weeks={weeks}
            editType={edit.type}
            user={edit.user}
            edits={edit.edits}
            handleChange={handleChange}
            closePopOut={closePopOut}
            onConfirm={
              edit.type === editTypes.UPDATE
                ? updateUser
                : edit.type === editTypes.CREATE
                ? submitNew
                : () => {}
            }
          />
          <Dialog
            maxWidth="sm"
            open={edit.type === editTypes.DELETE}
            onClose={closePopOut}
          >
            <DialogTitle>
              <Typography color="primary" fontWeight="bold" variant="h5">
                Delete {edit.user?.username}?
              </Typography>
            </DialogTitle>
            <Box px={1}>
              <Typography>
                Are you sure you wish to delete {edit.user?.firstName}{" "}
                {edit.user?.lastName}'s account?
              </Typography>
            </Box>
            <DialogActions>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={closePopOut}
                >
                  Cancel
                </Button>
                <Button variant="contained" color="error" onClick={deleteUser}>
                  DELETE
                </Button>
              </Stack>
            </DialogActions>
          </Dialog>
        </>
      )}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "secondary.main" }}>
              <TableCell>
                <Typography color="white">Username</Typography>
              </TableCell>
              <TableCell>
                <Typography color="white">First Name</Typography>
              </TableCell>
              <TableCell>
                <Typography color="white">Last Name</Typography>
              </TableCell>
              <TableCell>
                <Typography color="white">Role</Typography>
              </TableCell>
              <TableCell colSpan={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={toggleCreateNew}
                  endIcon={<AddCircle />}
                >
                  Create New User
                </Button>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow
                sx={{
                  "&:nth-of-type(even)": {
                    backgroundColor: "background.primary.light",
                  },
                }}
                key={`user-table-${u.username}`}
              >
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.firstName}</TableCell>
                <TableCell>{u.lastName}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>
                  <IconButton
                    color="secondary"
                    onClick={() => toggleUpdatePopOut(u)}
                  >
                    <Edit />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => toggleDeletePopOut(u)}>
                    <DeleteSharp />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default UsersPage;
