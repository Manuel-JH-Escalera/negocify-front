import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import useUserStore from "../stores/userStore";
import { useEffect, useState } from "react";
import { menuItemsConfig } from "../menuConfig.jsx";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Button,
  Alert,
  AlertTitle,
  Stack,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

function AccessDenied({ deniedPath }) {
  const navigate = useNavigate();
  return (
    <Alert severity="info">
      <AlertTitle>Acceso Denegado</AlertTitle>
      <Stack spacing={2}>
        <Box>
          No tienes los permisos necesarios para acceder a esta sección (
          {deniedPath}). Por favor, contacta al administrador si crees que esto
          es un error.
        </Box>
        <Box>
          <Button
            variant="contained"
            onClick={() => navigate("/dashboard/inicio")}
          >
            Volver a Inicio
          </Button>
        </Box>
      </Stack>
    </Alert>
  );
}

const drawerWidth = 240;

const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "isMobile",
})(({ theme, open, isMobile }) => ({
  width: "100%",
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: isMobile ? 0 : `-${drawerWidth}px`,
  ...(open &&
    !isMobile && {
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  overflowX: "auto",
  "& .MuiCard-root": {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
  },
  "& .MuiTableContainer-root": {
    minWidth: 0,
    overflowX: "auto",
  },
  "& .MRT_TableContainer": {
    minWidth: 0,
    overflowX: "auto",
  },
}));

const AppBar = styled(MuiAppBar)(() => ({
  width: "100%",
  zIndex: "1400",
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function DrawerNegocify() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const {
    setUserData,
    setUserToken,
    userToken,
    setSelectedAlmacen,
    selectedAlmacen,
    userAlmacenes,
  } = useUserStore();

  useEffect(() => {
    if (!userToken) {
      navigate("/");
    }
  }, [userToken, navigate]);

  useEffect(() => {
    if (userAlmacenes && userAlmacenes.length > 0) {
      setSelectedAlmacen(userAlmacenes[0]);
    }
  }, [userAlmacenes, setSelectedAlmacen]);

  const cerrarSesion = () => {
    navigate("/");
    setUserData(null);
    setUserToken(null);
    setSelectedAlmacen(null);
  };

  const handleDrawerOpen = () => {
    setOpen(!open);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleAlmacenChange = (event) => {
    const selectedId = event.target.value;
    const selectedObject = userAlmacenes.find(
      (almacen) => almacen.id === selectedId
    );
    setSelectedAlmacen(selectedObject || null);
  };

  const currentPath = location.pathname;

  const currentAlmacenInfo = userAlmacenes?.find(
    (almacen) => almacen.id === selectedAlmacen?.id
  );
  const currentUserRole = currentAlmacenInfo ? currentAlmacenInfo.rol : null;
  const currentUserRoleLower = currentUserRole
    ? currentUserRole.toLowerCase()
    : null;

  const visibleMenuItems = menuItemsConfig.filter((item) => {
    if (
      !currentUserRoleLower ||
      !item.allowedRoles ||
      item.allowedRoles.length === 0
    ) {
      return false;
    }
    return item.allowedRoles.some(
      (allowedRole) => allowedRole.toLowerCase() === currentUserRoleLower
    );
  });

  let isCurrentRouteAllowed = false;
  const pathToCheck =
    currentPath === "/dashboard" ? "/dashboard/inicio" : currentPath;
  const routeConfig = menuItemsConfig.find((item) => item.path === pathToCheck);

  if (currentUserRoleLower) {
    if (routeConfig) {
      const rolesForPath = routeConfig.allowedRoles;
      if (!rolesForPath || rolesForPath.length === 0) {
        isCurrentRouteAllowed = true;
      } else {
        isCurrentRouteAllowed = rolesForPath.some(
          (role) => role.toLowerCase() === currentUserRoleLower
        );
      }
    } else if (currentPath.startsWith("/dashboard/")) {
      isCurrentRouteAllowed = false;
    } else {
      isCurrentRouteAllowed = false;
    }
  } else {
    isCurrentRouteAllowed = false;
  }

  if (!userToken) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box
            display={"flex"}
            justifyContent={"flex-start"}
            alignItems={"center"}
          >
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Negocify - {selectedAlmacen?.nombre || "Cargando..."}
            </Typography>
          </Box>
          <Box
            display={"flex"}
            justifyContent={"flex-end"}
            alignItems={"center"}
          >
            {userAlmacenes && userAlmacenes.length > 0 && (
              <FormControl
                sx={{ m: 1, minWidth: 150 }}
                size="small"
                variant="outlined"
              >
                <InputLabel
                  id="almacen-select-label"
                  sx={{ color: "white", "&.Mui-focused": { color: "white" } }}
                >
                  Almacén
                </InputLabel>
                <Select
                  labelId="almacen-select-label"
                  id="almacen-select"
                  value={selectedAlmacen?.id || ""}
                  label="Almacén"
                  onChange={handleAlmacenChange}
                  sx={{
                    color: "white",
                    ".MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.5)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "white",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "white",
                    },
                    ".MuiSvgIcon-root ": { fill: "white !important" },
                  }}
                >
                  {[...(userAlmacenes || [])]
                    .sort((a, b) => a.id - b.id)
                    .map((almacen) => (
                      <MenuItem key={almacen.id} value={almacen.id}>
                        {almacen.nombre}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            ...(isMobile && { position: "absolute" }),
          },
        }}
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {visibleMenuItems.map((item, index) => (
            <ListItem key={item.path || index} disablePadding>
              <ListItemButton
                component={NavLink}
                to={item.path}
                onClick={handleDrawerClose}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={cerrarSesion}>
              <ListItemIcon>
                {" "}
                <ExitToAppIcon />{" "}
              </ListItemIcon>
              <ListItemText primary={"Cerrar Sesión"} />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
      </Drawer>
      <Main open={open} isMobile={isMobile}>
        <DrawerHeader />
        {isCurrentRouteAllowed ? (
          <Outlet />
        ) : currentUserRoleLower ? (
          <AccessDenied deniedPath={currentPath} />
        ) : (
          <CircularProgress sx={{ display: "block", margin: "auto", mt: 4 }} />
        )}
      </Main>
    </Box>
  );
}
