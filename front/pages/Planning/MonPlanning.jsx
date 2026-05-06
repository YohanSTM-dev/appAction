import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api";

// ── Helpers dates ─────────────────────────────────────────────────────────────
const getLundi = (date) => {
    const d = new Date(date);
    const jour = d.getDay();
    const diff = jour === 0 ? -6 : 1 - jour;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

// Formate une date en "YYYY-MM-DD" en heure locale (évite le décalage UTC)
const toISO = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const toLabel = (date) =>
    date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

const toShort = (date) =>
    date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });

const getSemaine = (lundi) =>
    Array.from({ length: 7 }, (_, i) => {
        const d = new Date(lundi);
        d.setDate(d.getDate() + i);
        return d;
    });

const CRENEAU_LABEL = { matin: "☀️ Matin", soir: "🌙 Soir" };
const CRENEAU_COLOR = { matin: "#fef3c7", soir: "#ede9fe" };
const CRENEAU_BORDER = { matin: "#f59e0b", soir: "#7c3aed" };

// Jours de la semaine
const JOURS_SEMAINE = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export default function MonPlanning() {
    const navigate = useNavigate();

    const employe = JSON.parse(localStorage.getItem("employeConnecte") || "null");

    const [lundi, setLundi]         = useState(() => getLundi(new Date()));
    const semaine                    = getSemaine(lundi);

    const [plannings, setPlannings] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur]       = useState(null);

    // Redirection si non connecté
    useEffect(() => {
        if (!employe) navigate("/login");
    }, []); // eslint-disable-line

    // Chargement des plannings de l'employé pour la semaine sélectionnée
    useEffect(() => {
        if (!employe?.id) return;
        const charger = async () => {
            setChargement(true);
            setErreur(null);
            try {
                const rep = await fetch(
                    `${API_BASE_URL}/plannings/employe/${employe.id}/semaine?debut=${toISO(lundi)}`
                );
                setPlannings(rep.ok ? await rep.json() : []);
            } catch {
                setErreur("Impossible de charger le planning.");
            } finally {
                setChargement(false);
            }
        };
        charger();
    }, [lundi, employe?.id]);

    // Trouve le planning d'un jour précis
    const getPlanningDuJour = (date) => {
        const dateStr = toISO(date);
        return plannings.find((p) => p.dateDebut === dateStr) || null;
    };

    // Compte les jours travaillés cette semaine
    const joursTravailles = semaine.filter((j) => getPlanningDuJour(j) !== null).length;
    const joursRepos = 7 - joursTravailles;

    if (!employe) return null;

    return (
        <div style={{ maxWidth: "820px", margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>

            {/* En-tête */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ margin: "0 0 4px" }}>Mon planning</h1>
                    <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
                        {employe.prenomEmploye} {employe.nomEmploye}
                    </p>
                </div>
                <button onClick={() => navigate("/acceuil")} style={btnNav}>← Retour</button>
            </div>

            {erreur && (
                <p style={{ color: "crimson", background: "#fff1f2", border: "1px solid #fecaca", padding: "8px 12px", borderRadius: "6px" }}>
                    {erreur}
                </p>
            )}

            {/* Navigation semaine */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px", flexWrap: "wrap" }}>
                <button onClick={() => setLundi((l) => { const d = new Date(l); d.setDate(d.getDate() - 7); return d; })} style={btnNav}>← Préc.</button>
                <strong style={{ fontSize: "15px" }}>Semaine du {toShort(semaine[0])} au {toShort(semaine[6])}</strong>
                <button onClick={() => setLundi((l) => { const d = new Date(l); d.setDate(d.getDate() + 7); return d; })} style={btnNav}>Suiv. →</button>
                <button onClick={() => setLundi(getLundi(new Date()))} style={{ ...btnNav, background: "#e0f2fe", color: "#0369a1" }}>Aujourd'hui</button>
            </div>

            {/* Récap semaine */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                <RecapBadge label="Jours travaillés" valeur={`${joursTravailles} / 5`} couleur="#3b82f6" />
                <RecapBadge label="Jours de repos" valeur={joursRepos} couleur={joursRepos >= 2 ? "#16a34a" : "#dc2626"} />
            </div>

            {chargement ? (
                <p style={{ textAlign: "center", color: "#6b7280" }}>Chargement...</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {semaine.map((jour, idx) => {
                        const planning = getPlanningDuJour(jour);
                        const estAujourdhui = toISO(jour) === toISO(new Date());
                        const creneau = planning?.creneau;
                        const taches = planning?.tache_id_TacheMags || [];

                        return (
                            <div
                                key={toISO(jour)}
                                style={{
                                    border: `2px solid ${estAujourdhui ? "#3b82f6" : (creneau ? CRENEAU_BORDER[creneau] : "#e2e8f0")}`,
                                    borderRadius: "10px",
                                    padding: "14px 18px",
                                    background: creneau ? CRENEAU_COLOR[creneau] : (planning ? "#f0fdf4" : "#f9fafb"),
                                }}
                            >
                                {/* Ligne titre */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <span style={{ fontWeight: "bold", fontSize: "15px" }}>
                                            {estAujourdhui ? "🔵 " : ""}{JOURS_SEMAINE[idx]}
                                        </span>
                                        <span style={{ color: "#6b7280", fontSize: "13px" }}>
                                            {jour.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                                        </span>
                                    </div>

                                    {/* Badge statut */}
                                    {planning ? (
                                        <span style={{
                                            padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold",
                                            background: creneau ? CRENEAU_BORDER[creneau] : "#22c55e", color: "#fff",
                                        }}>
                                            {creneau ? CRENEAU_LABEL[creneau] : "✅ Planifié"}
                                        </span>
                                    ) : (
                                        <span style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", background: "#e5e7eb", color: "#6b7280" }}>
                                            😴 Repos
                                        </span>
                                    )}
                                </div>

                                {/* Tâches du jour */}
                                {taches.length > 0 && (
                                    <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                        {taches.map((t) => (
                                            <span
                                                key={t.id}
                                                style={{
                                                    padding: "4px 12px", borderRadius: "12px", fontSize: "13px",
                                                    background: t.couleur_tache?.couleur || "#e5e7eb", color: "#fff",
                                                }}
                                            >
                                                {t.nomTache}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Pas de tâche mais planifié */}
                                {planning && taches.length === 0 && (
                                    <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#6b7280" }}>
                                        Aucune tâche assignée pour ce jour.
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── Composants internes ───────────────────────────────────────────────────────
function RecapBadge({ label, valeur, couleur }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#fff", border: `2px solid ${couleur}`, borderRadius: "10px", padding: "10px 20px", minWidth: "110px" }}>
            <span style={{ fontSize: "22px", fontWeight: "bold", color: couleur }}>{valeur}</span>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>{label}</span>
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const btnNav = { padding: "6px 14px", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", background: "#f8fafc" };
