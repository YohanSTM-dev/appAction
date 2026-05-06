import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Connexion/Login.jsx"; 
import ListeEmployes from "../pages/Employe/ListeEmployes.jsx";
import Register from "../pages/Connexion/Register.jsx";
import RegisterAdmin from "../pages/Administrateur/RegisterAdmin.jsx";
import Direction from "../pages/Direction/Direction.jsx";
import Acceuil from "../pages/Acceuil.jsx";
import DemandeConge from "../pages/Conge/DemandeConge.jsx";
import GestionConges from "../pages/Conge/GestionConges.jsx";
import CoffreFort from "../pages/Paie/CoffreFort.jsx";
import GestionPlanning from "../pages/Planning/GestionPlanning.jsx";
import MonPlanning from "../pages/Planning/MonPlanning.jsx";
import EspaceRH from "../pages/RH/EspaceRH.jsx";
import { estConnecte, estAdmin, estRH, estManager } from "./utils/roles.js";

// ── Gardes de routes ─────────────────────────────────────────────────────────
// Chaque garde vérifie le rôle et redirige si l'accès est interdit.

function RoutePrivee({ children }) {
  return estConnecte() ? children : <Navigate to="/login" replace />;
}

function RoutePriveeAdmin({ children }) {
  if (!estConnecte()) return <Navigate to="/login" replace />;
  if (!estAdmin()) return <Navigate to="/acceuil" replace />;
  return children;
}

function RoutePriveeRH({ children }) {
  if (!estConnecte()) return <Navigate to="/login" replace />;
  if (!estRH()) return <Navigate to="/acceuil" replace />;
  return children;
}

function RoutePriveeManager({ children }) {
  if (!estConnecte()) return <Navigate to="/login" replace />;
  if (!estManager()) return <Navigate to="/acceuil" replace />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      
      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/employes" element={<ListeEmployes />} />

      <Route path="/admin" element={<RegisterAdmin />}/>

      <Route
        path="/acceuil"
        element={
          <RoutePrivee>
            <Acceuil />
          </RoutePrivee>
        }
      />

      <Route
        path="/direction"
        element={
          <RoutePriveeAdmin>
            <Direction />
          </RoutePriveeAdmin>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />

      {/* Congés : demande (employé) */}
      <Route
        path="/conge/demande"
        element={
          <RoutePrivee>
            <DemandeConge />
          </RoutePrivee>
        }
      />

      {/* Congés : gestion (manager ou admin) */}
      <Route
        path="/conge/gestion"
        element={
          <RoutePriveeManager>
            <GestionConges />
          </RoutePriveeManager>
        }
      />

      {/* Coffre-Fort Numérique (employé) */}
      <Route
        path="/paie/coffre-fort"
        element={
          <RoutePrivee>
            <CoffreFort />
          </RoutePrivee>
        }
      />

      {/* Mon planning (employé : vue lecture seule de sa semaine) */}
      <Route
        path="/planning/mon-planning"
        element={
          <RoutePrivee>
            <MonPlanning />
          </RoutePrivee>
        }
      />

      {/* Gestion du planning (manager ou admin) */}
      <Route
        path="/planning/gestion"
        element={
          <RoutePriveeManager>
            <GestionPlanning />
          </RoutePriveeManager>
        }
      />

      {/* Espace RH (rh ou admin) */}
      <Route
        path="/rh"
        element={
          <RoutePriveeRH>
            <EspaceRH />
          </RoutePriveeRH>
        }
      />

    </Routes>
  );
}

export default App;