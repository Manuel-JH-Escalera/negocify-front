import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter, Routes, Route } from "react-router";
import DrawerNegocify from "../components/Drawer";
import Ventas from "../views/Ventas";
import Inventario from "../views/Inventario.jsx";
import PuntoDeVentas from "../views/PuntoDeVentas.jsx";
import Usuarios from "../views/Usuarios.jsx";
import Inicio from "../views/Inicio.jsx";
import Login from "../views/Login.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />

        {/* rutas autenticación */}
        <Route path="login" element={<Login />} />

        {/* rutas aplicacion */}
        <Route path="dashboard" element={<DrawerNegocify />}>
          <Route path="inicio" element={<Inicio />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="punto-venta" element={<PuntoDeVentas />} />
          <Route path="usuarios" element={<Usuarios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
