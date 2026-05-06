import { useNavigate } from "react-router-dom";
import { estAdmin, estManager, estRH } from "../src/utils/roles.js";

// ── Tuile de navigation ───────────────────────────────────────────────────────
function Tuile({ emoji, label, description, onClick }) {
    return (
        <div
            onClick={onClick}
            style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start",
                gap: "6px", padding: "18px 20px", borderRadius: "10px",
                background: "#fff", border: "2px solid #E3001B",
                cursor: "pointer", width: "200px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                transition: "box-shadow 0.15s, transform 0.12s",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(227,0,27,0.18)";
                e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.07)";
                e.currentTarget.style.transform = "translateY(0)";
            }}
        >
            <span style={{ fontSize: "28px" }}>{emoji}</span>
            <strong style={{ color: "#E3001B", fontSize: "15px" }}>{label}</strong>
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
        <>
            {/* ── Barre de navigation Action ── */}
            <nav className="action-navbar">
                <span className="action-logo">action</span>
                <span className="nav-title">Espace collaborateur</span>
                <span className="nav-spacer" />
                <button onClick={handleDeconnexion}>Se déconnecter</button>
            </nav>

            <div style={{ maxWidth: "880px", margin: "36px auto", padding: "0 16px" }}>

                {/* En-tête employé */}
                <div style={{
                    background: "#fff", borderRadius: "12px",
                    padding: "20px 24px", marginBottom: "8px",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
                    borderLeft: "4px solid #E3001B",
                }}>
                    <h1 style={{ margin: 0, fontSize: "1.4em" }}>
                        Bonjour, {employe.prenomEmploye} {employe.nomEmploye} 👋
                    </h1>
                    <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "14px" }}>
                        {rolesLabel} · {employe.magasin_nom ?? "Magasin non défini"}
                    </p>
                </div>

                {/* Fiche récap rapide */}
                <div style={{
                    display: "flex", gap: "16px", flexWrap: "wrap",
                    background: "#fff", borderRadius: "10px",
                    padding: "16px 24px", marginBottom: "4px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}>
                    <Info label="Matricule"       value={employe.matriculeEmploye} />
                    <Info label="Email"           value={employe.emailEmploye} />
                    <Info label="Date d'embauche" value={employe.date_embauche ?? "—"} />
                    <Info label="Contrat"         value={employe.type_contrat_id ?? "—"} />
                </div>

                {/* ── Espace Personnel (tous les employés) ── */}
                <Section titre="Mon espace">
                    <Tuile emoji="📅" label="Mon planning"   description="Ma semaine de travail"   onClick={() => navigate("/planning/mon-planning")} />
                    <Tuile emoji="🗓" label="Mes congés"     description="Poser une demande"        onClick={() => navigate("/conge/demande")} />
                    <Tuile emoji="🗄️" label="Fiches de paie" description="Coffre-fort numérique"   onClick={() => navigate("/paie/coffre-fort")} />
                </Section>

                {/* ── Espace Manager (manager / admin) ── */}
                {estManager() && (
                    <Section titre="Gestion magasin">
                        <Tuile emoji="📋" label="Planning équipe" description="Vue semaine, tâches"  onClick={() => navigate("/planning/gestion")} />
                        <Tuile emoji="✅" label="Congés équipe"   description="Valider / refuser"    onClick={() => navigate("/conge/gestion")} />
                    </Section>
                )}

                {/* ── Espace RH (rh / admin) ── */}
                {estRH() && (
                    <Section titre="Ressources Humaines">
                        <Tuile emoji="👥" label="Espace RH" description="Employés, contrats" onClick={() => navigate("/rh")} />
                    </Section>
                )}

                {/* ── Espace Direction (admin uniquement) ── */}
                {estAdmin() && (
                    <Section titre="Direction">
                        <Tuile emoji="🏢" label="Direction" description="Vue d'ensemble"         onClick={() => navigate("/direction")} />
                        <Tuile emoji="🔐" label="Admin"     description="Créer un compte admin"  onClick={() => navigate("/admin")} />
                    </Section>
                )}
            </div>
        </>
    );
}

// ── Composants internes ───────────────────────────────────────────────────────
function Section({ titre, children }) {
    return (
        <div style={{ marginTop: "28px" }}>
            <h2 style={{
                fontSize: "12px", fontWeight: "700", color: "#E3001B",
                marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.08em",
                display: "flex", alignItems: "center", gap: "8px",
            }}>
                <span style={{ flex: 1, height: "1px", background: "#fecaca" }} />
                {titre}
                <span style={{ flex: 1, height: "1px", background: "#fecaca" }} />
            </h2>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>{children}</div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div style={{ minWidth: "140px" }}>
            <div style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
            <div style={{ fontSize: "14px", color: "#111827", fontWeight: "600" }}>{value}</div>
        </div>
    );
}

