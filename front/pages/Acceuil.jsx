import { useNavigate } from "react-router-dom";

export default function Acceuil() {
    const navigate = useNavigate();

    const employe = JSON.parse(localStorage.getItem("employeConnecte") || "null");

    const handleDeconnexion = () => {
        localStorage.removeItem("employeConnecte");
        navigate("/login");
    };

    if (!employe) {
        return <p>Chargement...</p>;
    }

    return (
        <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "sans-serif" }}>
            <h1>Bienvenue, {employe.prenomEmploye} {employe.nomEmploye} !</h1>

            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
                <tbody>
                    <tr>
                        <td style={tdLabel}>Matricule</td>
                        <td style={tdValue}>{employe.matriculeEmploye}</td>
                    </tr>
                    <tr>
                        <td style={tdLabel}>Email</td>
                        <td style={tdValue}>{employe.emailEmploye}</td>
                    </tr>
                    <tr>
                        <td style={tdLabel}>Date d'embauche</td>
                        <td style={tdValue}>{employe.date_embauche ?? "—"}</td>
                    </tr>
                    <tr>
                        <td style={tdLabel}>Magasin</td>
                        <td style={tdValue}>{employe.magasin_nom ?? "—"}</td>
                    </tr>
                    <tr>
                        <td style={tdLabel}>Type de contrat</td>
                        <td style={tdValue}>{employe.type_contrat_id ?? "—"}</td>
                    </tr>
                    <tr>
                        <td style={tdLabel}>Rôles</td>
                        <td style={tdValue}>
                            {(() => {
                                // Les rôles peuvent être des strings ou des objets {nomRole}
                                // selon la version du backend avec laquelle l'utilisateur s'est connecté
                                // employe.roles est le tableau renvoyé par le backend lors du login
                                const roles = employe.roles || [];
                                if (roles.length === 0) return "Aucun rôle";
                                return roles
                                    .map((r) => (typeof r === "string" ? r : r.nomRole))
                                    .join(", ");
                            })()}
                        </td>
                    </tr>
                </tbody>
            </table>

            <button
                onClick={handleDeconnexion}
                style={{ marginTop: "30px", padding: "8px 20px", cursor: "pointer" }}
            >
                Se déconnecter
            </button>

            {/* Liens rapides vers les espaces employé */}
            <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                    onClick={() => navigate("/conge/demande")}
                    style={{ padding: "8px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                    🗓 Mes congés
                </button>
                <button
                    onClick={() => navigate("/paie/coffre-fort")}
                    style={{ padding: "8px 16px", background: "#8b5cf6", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                    🗄️ Mes fiches de paie
                </button>
            </div>
        </div>

    );
}

const tdLabel = { fontWeight: "bold", padding: "8px 12px", borderBottom: "1px solid #ddd", width: "40%" };
const tdValue = { padding: "8px 12px", borderBottom: "1px solid #ddd" };
