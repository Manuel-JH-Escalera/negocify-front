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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotFound from "../views/NotFound.jsx";

// Create a client
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          {/* rutas aplicacion */}
          <Route path="dashboard" element={<DrawerNegocify />}>
            <Route path="inicio" element={<Inicio />} />
            <Route path="ventas" element={<Ventas />} />
            <Route path="inventario" element={<Inventario />} />
            <Route path="punto-venta" element={<PuntoDeVentas />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  </QueryClientProvider>
);
