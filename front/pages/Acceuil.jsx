import { useNavigate } from "react-router-dom";
import { estAdmin, estManager, estRH } from "../src/utils/roles.js";

// ── Tuile de navigation ───────────────────────────────────────────────────────
function Tuile({ emoji, label, description, couleur, onClick }) {
    return (
        <div
            onClick={onClick}
            style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start",
                gap: "6px", padding: "18px 20px", borderRadius: "10px",
                background: "#fff", border: `2px solid ${couleur}`,
                cursor: "pointer", width: "200px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                transition: "box-shadow 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.13)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.07)"}
        >
            <span style={{ fontSize: "28px" }}>{emoji}</span>
            <strong style={{ color: couleur, fontSize: "15px" }}>{label}</strong>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>{description}</span>
        </div>
    );
}

export default function Acceuil() {
    const navigate = useNavigate();

    // Infos de l'employé connecté (stockées au login)
    const employe = JSON.parse(localStorage.getItem("employeConnecte") || "null");

    const handleDeconnexion = () => {
        localStorage.removeItem("employeConnecte");
        navigate("/login");
    };

    if (!employe) return <p>Chargement...</p>;

    // Libellé lisible des rôles
    const rolesLabel = (employe.roles || [])
        .map((r) => (typeof r === "string" ? r : r.nomRole))
        .join(", ") || "Employé";

    return (
        <div style={{ maxWidth: "860px", margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>

            {/* En-tête */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <h1 style={{ margin: 0 }}>Bonjour, {employe.prenomEmploye} {employe.nomEmploye} 👋</h1>
                    <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "14px" }}>
                        {rolesLabel} · {employe.magasin_nom ?? "Magasin non défini"}
                    </p>
                </div>
                <button onClick={handleDeconnexion} style={{ padding: "8px 18px", border: "1px solid #e5e7eb", borderRadius: "6px", cursor: "pointer", background: "#f9fafb", color: "#374151" }}>
                    Se déconnecter
                </button>
            </div>

            {/* Fiche récap rapide */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "24px", background: "#f8fafc", borderRadius: "10px", padding: "16px" }}>
                <Info label="Matricule"      value={employe.matriculeEmploye} />
                <Info label="Email"          value={employe.emailEmploye} />
                <Info label="Date d'embauche" value={employe.date_embauche ?? "—"} />
                <Info label="Contrat"        value={employe.type_contrat_id ?? "—"} />
            </div>

            {/* ── Espace Personnel (tous les employés) ── */}
            <Section titre="Mon espace">
                <Tuile emoji="🗓" label="Mes congés"        description="Poser une demande" couleur="#3b82f6" onClick={() => navigate("/conge/demande")} />
                <Tuile emoji="🗄️" label="Fiches de paie"   description="Coffre-fort numérique" couleur="#8b5cf6" onClick={() => navigate("/paie/coffre-fort")} />
            </Section>

            {/* ── Espace Manager (manager / admin) ── */}
            {estManager() && (
                <Section titre="Gestion magasin">
                    <Tuile emoji="📅" label="Planning"        description="Vue semaine, tâches" couleur="#f59e0b" onClick={() => navigate("/planning/gestion")} />
                    <Tuile emoji="📋" label="Congés équipe"   description="Valider / refuser"   couleur="#f97316" onClick={() => navigate("/conge/gestion")} />
                </Section>
            )}

            {/* ── Espace RH (rh / admin) ── */}
            {estRH() && (
                <Section titre="Ressources Humaines">
                    <Tuile emoji="👥" label="Espace RH"       description="Employés, contrats"   couleur="#10b981" onClick={() => navigate("/rh")} />
                </Section>
            )}

            {/* ── Espace Direction (admin uniquement) ── */}
            {estAdmin() && (
                <Section titre="Direction">
                    <Tuile emoji="🏢" label="Direction"       description="Vue d'ensemble"       couleur="#6366f1" onClick={() => navigate("/direction")} />
                    <Tuile emoji="🔐" label="Admin"           description="Créer un compte admin" couleur="#dc2626" onClick={() => navigate("/admin")} />
                </Section>
            )}
        </div>
    );
}

// ── Composants internes ───────────────────────────────────────────────────────
function Section({ titre, children }) {
    return (
        <div style={{ marginTop: "28px" }}>
            <h2 style={{ fontSize: "15px", color: "#374151", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{titre}</h2>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>{children}</div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div style={{ minWidth: "140px" }}>
            <div style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase" }}>{label}</div>
            <div style={{ fontSize: "14px", color: "#111827", fontWeight: "500" }}>{value}</div>
        </div>
    );
}
