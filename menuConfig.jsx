import HomeIcon from "@mui/icons-material/Home";
import StorefrontIcon from "@mui/icons-material/Storefront";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InventoryIcon from "@mui/icons-material/Inventory";
import PersonIcon from "@mui/icons-material/Person";

export const menuItemsConfig = [
  {
    text: "Inicio",
    path: "/dashboard/inicio",
    icon: <HomeIcon />,
    allowedRoles: ["Administrador Sistema", "Administrador", "Empleado"],
  },
  {
    text: "Punto de Venta",
    path: "/dashboard/punto-venta",
    icon: <StorefrontIcon />,
    allowedRoles: ["Administrador Sistema", "Administrador", "Empleado"],
  },
  {
    text: "Ventas",
    path: "/dashboard/ventas",
    icon: <TrendingUpIcon />,
    allowedRoles: ["Administrador Sistema", "Administrador"],
  },
  {
    text: "Inventario",
    path: "/dashboard/inventario",
    icon: <InventoryIcon />,
    allowedRoles: ["Administrador Sistema", "Administrador"],
  },
  {
    text: "Usuarios",
    path: "/dashboard/usuarios",
    icon: <PersonIcon />,
    allowedRoles: ["Administrador Sistema", "Administrador"],
  },
];
