import {
  TextField,
  Stack,
  Button,
  Box,
  Typography,
  Alert,
  Card,
} from "@mui/material";
import { useState } from "react";
import useUserStore from "../stores/userStore";
import { useNavigate } from "react-router";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { setUserToken, setUserData, setUserAlmacenes } = useUserStore();

  const handleChange = (e) => {
    const { id, value } = e.target;
    const fieldName = id.replace("outlined-", "");

    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await userLogin(formData);
      setUserToken(response?.data?.token);
      setUserData({
        ...response?.data?.usuario,
        isAdmin: response?.data?.permisos?.esAdminSistema,
      });
      setUserAlmacenes(response?.data?.permisos?.almacenes);
      navigate("/dashboard/inicio");
    } catch (error) {
      setError(error.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  async function userLogin(formData) {
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      throw error;
    }
  }

  return (
    <Box
      display={"flex"}
      justifyContent={"center"}
      height={"100vh"}
      alignItems={"center"}
    >
      <Card
        sx={{
          width: {
            sm: "60%",
            md: "30%",
          },
          padding: 2,
        }}
      >
        <Stack component="form" onSubmit={handleSubmit} spacing={2}>
          <Typography variant="h3" align="center">
            Negocify
          </Typography>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}

          <TextField
            id="outlined-email"
            label="Email"
            variant="outlined"
            value={formData.email}
            onChange={handleChange}
            type="email"
            fullWidth
          />

          <TextField
            id="outlined-password"
            label="Contraseña"
            variant="outlined"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
          />

          <Button variant="contained" type="submit" disabled={isLoading}>
            {isLoading ? "Procesando..." : "Iniciar Sesión"}
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}
