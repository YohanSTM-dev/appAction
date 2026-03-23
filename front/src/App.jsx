import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Connexion/Login.jsx"; 
import ListeEmployes from "../pages/Employe/ListeEmployes.jsx";
import Register from "../pages/Connexion/Register.jsx";
import RegisterAdmin from "../pages/Administrateur/RegisterAdmin.jsx";
import Direction from "../pages/Direction/Direction.jsx";

const estConnecte = () => {
  try {
    return Boolean(JSON.parse(localStorage.getItem("employeConnecte") || "null"));
  } catch {
    return false;
  }
};

function RoutePrivee({ children }) {
  return estConnecte() ? children : <Navigate to="/login" replace />;
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
        path="/direction"
        element={
          <RoutePrivee>
            <Direction />
          </RoutePrivee>
        }
      />

    </Routes>
  );
}

export default App;