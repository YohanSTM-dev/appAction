import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

function lireEmployeConnecte() {
  try {
    return JSON.parse(localStorage.getItem("employeConnecte") || "null");
  } catch {
    return null;
  }
}

export default function Direction() {
  const navigate = useNavigate();
  const employe = useMemo(() => lireEmployeConnecte(), []);

  const handleLogout = () => {
    localStorage.removeItem("employeConnecte");
    navigate("/login");
  };

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
      <h1>Espace Direction</h1>
      <p>Bienvenue sur la page de direction.</p>

      {employe && (
        <div style={{ background: "#f6f6f6", padding: "14px", borderRadius: "8px" }}>
          <p><strong>Nom :</strong> {employe.nomEmploye || "-"}</p>
          <p><strong>Prenom :</strong> {employe.prenomEmploye || "-"}</p>
          <p><strong>Email :</strong> {employe.emailEmploye || "-"}</p>
          <p><strong>Matricule :</strong> {employe.matriculeEmploye || "-"}</p>
        </div>
      )}

      <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button type="button" onClick={() => navigate("/employes")}>Voir les employés</button>
        <button type="button" onClick={() => navigate("/conge/gestion")} style={{ background: "#22c55e", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "4px", cursor: "pointer" }}>
          🗓 Gérer les congés
        </button>
        <button type="button" onClick={handleLogout}>Se déconnecter</button>
      </div>
    </div>
  );
}
