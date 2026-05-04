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

const estConnecte = () => {
  try {
    return Boolean(JSON.parse(localStorage.getItem("employeConnecte") || "null"));
  } catch {
    return false;
  }
};

// Vérifie si l'employé connecté possède un rôle admin
const estAdmin = () => {
  try {
    const employe = JSON.parse(localStorage.getItem("employeConnecte") || "null");
    if (!employe) return false;
    return (employe.roles || []).some((r) => r.toLowerCase().includes("admin"));
  } catch {
    return false;
  }
};

// Route accessible uniquement si connecté
function RoutePrivee({ children }) {
  return estConnecte() ? children : <Navigate to="/login" replace />;
}

// Route accessible uniquement si connecté ET admin
function RoutePriveeAdmin({ children }) {
  if (!estConnecte()) return <Navigate to="/login" replace />;
  if (!estAdmin()) return <Navigate to="/acceuil" replace />;
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

      {/* Congés : gestion (manager/admin) */}
      <Route
        path="/conge/gestion"
        element={
          <RoutePriveeAdmin>
            <GestionConges />
          </RoutePriveeAdmin>
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

    </Routes>
  );
}

export default App;