import ParkTwoToneIcon from "@mui/icons-material/ParkTwoTone";
import { useState, useContext } from "react";
import UserContext from "./UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import tw from "twin.macro";
import "styled-components/macro";
import logo from "../cl.png";
import usePops from "../hooks/usePops";
import catchErrors from "../utils/fetchErrorHandling";
import { Box, Button, Card, Stack, TextField, Typography } from "@mui/material";

const Login = () => {
  const auth = useContext(UserContext);
  const [formInputs, setFormInputs] = useState({
    username: "",
    password: "",
  });
  const { PopsBar, shamefulFailure, greatSuccess, clearPops } = usePops();
  const clearPassword = () => {
    setFormInputs((f) => ({ ...f, password: "" }));
  };
  const location = useLocation();
  const { cameFrom } = location.state || { cameFrom: null };
  const navigate = useNavigate();
  const handleUpdate = (e) => {
    clearPops();
    const field = e.target.name;
    const value = e.target.value;
    setFormInputs((f) => {
      return {
        ...f,
        [field]: value,
      };
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const reqOptions = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: formInputs.username,
        password: formInputs.password,
      }),
    };
    const result = await fetch("/auth/login", reqOptions);
    const data = await catchErrors(result, (e) => {
      setFormInputs((f) => ({ ...f, password: "" }));
      shamefulFailure("SHAME!", e.message);
    });
    if (data) {
      const userData = await data.json();
      auth.logIn(userData.token, userData.user);
      navigate(cameFrom || "/");
    }
  };
  return (
    <Box maxWidth={400}>
      <form onSubmit={handleSubmit}>
        <Stack justifyContent="center" mb={8}>
          <Typography
            lineHeight={0.8}
            variant="h1"
            textAlign="center"
            fontWeight="bold"
            color="primary"
          >
            Boynton
          </Typography>
          <Typography variant="h3" textAlign="center" color="secondary">
            Camp Leslie
          </Typography>
        </Stack>
        <Box display="flex" flexDirection="column">
          <Stack spacing={2}>
            <TextField
              inputProps={{
                autoCapitalize: "none",
                autoComplete: "off",
              }}
              label="username"
              name="username"
              autoFocus="on"
              autoComplete="off"
              autoCapitalize="off"
              id="usernameInput"
              onChange={handleUpdate}
              value={formInputs.username}
              required
            />
            <TextField
              type="password"
              onChange={handleUpdate}
              required
              name="password"
              id="passwordInput"
              label="password"
              value={formInputs.password}
            />
            <Button type="submit" variant="contained" color="primary">
              <ParkTwoToneIcon />
              Login{" "}
            </Button>
          </Stack>
        </Box>
      </form>

      <PopsBar />
    </Box>
  );
};

export default Login;
