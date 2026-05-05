import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api";

// ── Helpers dates ─────────────────────────────────────────────────────────────
// Retourne la date du lundi de la semaine contenant `date`
const getLundi = (date) => {
    const d = new Date(date);
    const jour = d.getDay(); // 0=dim, 1=lun...
    const diff = (jour === 0 ? -6 : 1 - jour);
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

// Formate une date en "YYYY-MM-DD" (pour l'API)
const toISO = (date) => date.toISOString().split("T")[0];

// Formate une date en "Lun 4 mai" (pour l'affichage)
const toLabel = (date) =>
    date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });

// Génère les 7 jours d'une semaine à partir du lundi
const getSemaine = (lundi) =>
    Array.from({ length: 7 }, (_, i) => {
        const d = new Date(lundi);
        d.setDate(d.getDate() + i);
        return d;
    });

export default function GestionPlanning() {
    const navigate = useNavigate();

    const employe = JSON.parse(localStorage.getItem("employeConnecte") || "null");
    const magasinId = employe?.magasin_id ?? null;

    // ── État semaine ──────────────────────────────────────────────────
    const [lundi, setLundi] = useState(() => getLundi(new Date()));
    const semaine = getSemaine(lundi);

    // ── Données ───────────────────────────────────────────────────────
    const [employes, setEmployes]     = useState([]);
    const [plannings, setPlannings]   = useState([]);
    const [taches, setTaches]         = useState([]);
    const [couleurs, setCouleurs]     = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur]         = useState(null);

    // ── Modal "choisir une tâche" ─────────────────────────────────────
    const [modal, setModal] = useState(null);

    // ── Formulaire nouvelle tâche ─────────────────────────────────────
    const [formTache, setFormTache] = useState({ nomTache: "", couleur_tache_id: "" });
    const [msgTache, setMsgTache]   = useState("");

    // Redirection si non connecté (après les hooks — Rules of Hooks)
    useEffect(() => {
        if (!magasinId) navigate("/login");
    }, [magasinId, navigate]);

    // ── Chargement des données au changement de semaine ───────────────
    useEffect(() => {
        if (!magasinId) return;
        const charger = async () => {
            setChargement(true);
            setErreur(null);
            try {
                const [repEmp, repPlan, repTaches, repCouleurs] = await Promise.all([
                    fetch(`${API_BASE_URL}/employes/magasin/${magasinId}`),
                    fetch(`${API_BASE_URL}/plannings/magasin/${magasinId}/semaine?debut=${toISO(lundi)}`),
                    fetch(`${API_BASE_URL}/taches`),
                    fetch(`${API_BASE_URL}/taches/couleurs`),
                ]);
                setEmployes(repEmp.ok ? await repEmp.json() : []);
                setPlannings(repPlan.ok ? await repPlan.json() : []);
                setTaches(repTaches.ok ? await repTaches.json() : []);
                setCouleurs(repCouleurs.ok ? await repCouleurs.json() : []);
            } catch {
                setErreur("Impossible de charger les données.");
            } finally {
                setChargement(false);
            }
        };
        charger();
    }, [lundi, magasinId]);

    // ── Récupère les tâches d'un employé pour un jour donné ───────────
    const getTachesDuJour = (employeId, date) => {
        const dateStr = toISO(date);
        const planning = plannings.find(
            (p) => p.employe?.id === employeId && p.dateDebut === dateStr
        );
        return planning?.tache_id_TacheMags || [];
    };

    // ── Assigner une tâche (depuis le modal) ──────────────────────────
    const assignerTache = async (tacheId) => {
        if (!modal) return;
        try {
            await fetch(`${API_BASE_URL}/plannings/assigner-tache`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employe_id: modal.employe_id, date: modal.date, tache_id: tacheId }),
            });
            // Rechargement des plannings uniquement
            const rep = await fetch(`${API_BASE_URL}/plannings/magasin/${magasinId}/semaine?debut=${toISO(lundi)}`);
            setPlannings(rep.ok ? await rep.json() : []);
            setModal(null);
        } catch { setErreur("Erreur lors de l'assignation."); }
    };

    // ── Retirer une tâche (clic sur le badge coloré) ──────────────────
    const retirerTache = async (employeId, date, tacheId) => {
        try {
            await fetch(`${API_BASE_URL}/plannings/retirer-tache`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employe_id: employeId, date: toISO(date), tache_id: tacheId }),
            });
            const rep = await fetch(`${API_BASE_URL}/plannings/magasin/${magasinId}/semaine?debut=${toISO(lundi)}`);
            setPlannings(rep.ok ? await rep.json() : []);
        } catch { setErreur("Erreur lors du retrait."); }
    };

    // ── Créer une nouvelle tâche dans le catalogue ────────────────────
    const creerTache = async (e) => {
        e.preventDefault();
        setMsgTache("");
        try {
            const rep = await fetch(`${API_BASE_URL}/taches`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nomTache: formTache.nomTache, couleur_tache_id: formTache.couleur_tache_id }),
            });
            if (!rep.ok) throw new Error("Erreur création tâche.");
            const nouvelle = await rep.json();
            // On recharge les tâches avec les couleurs incluses
            const repTaches = await fetch(`${API_BASE_URL}/taches`);
            setTaches(repTaches.ok ? await repTaches.json() : []);
            setFormTache({ nomTache: "", couleur_tache_id: "" });
            setMsgTache(`Tâche "${nouvelle.nomTache}" créée !`);
        } catch (err) { setMsgTache(err.message); }
    };

    if (chargement) return <p style={{ textAlign: "center", marginTop: "40px" }}>Chargement...</p>;

    return (
        <div style={{ maxWidth: "1200px", margin: "30px auto", fontFamily: "sans-serif", padding: "0 12px" }}>
            <h1 style={{ marginBottom: "4px" }}>Planning du magasin</h1>
            <p style={{ color: "#6b7280", marginTop: 0 }}>
                Cliquez sur une cellule pour assigner une tâche. Cliquez sur une tâche pour la retirer.
            </p>

            {erreur && <p style={{ color: "crimson" }}>{erreur}</p>}

            {/* ── Navigation semaine ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                <button onClick={() => setLundi((l) => { const d = new Date(l); d.setDate(d.getDate() - 7); return d; })} style={btnNav}>← Semaine préc.</button>
                <strong>Semaine du {toLabel(semaine[0])} au {toLabel(semaine[6])}</strong>
                <button onClick={() => setLundi((l) => { const d = new Date(l); d.setDate(d.getDate() + 7); return d; })} style={btnNav}>Semaine suiv. →</button>
                <button onClick={() => setLundi(getLundi(new Date()))} style={{ ...btnNav, background: "#e0f2fe", color: "#0369a1" }}>Aujourd'hui</button>
            </div>

            {/* ── Grille planning ── */}
            <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "700px" }}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Employé</th>
                            {semaine.map((jour) => (
                                <th key={toISO(jour)} style={thStyle}>
                                    {toLabel(jour)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {employes.map((emp) => (
                            <tr key={emp.id}>
                                <td style={{ ...tdStyle, fontWeight: "bold", whiteSpace: "nowrap" }}>
                                    {emp.prenomEmploye} {emp.nomEmploye}
                                </td>
                                {semaine.map((jour) => {
                                    const tachesDuJour = getTachesDuJour(emp.id, jour);
                                    return (
                                        <td
                                            key={toISO(jour)}
                                            style={{ ...tdStyle, cursor: "pointer", minWidth: "110px" }}
                                            onClick={() => setModal({ employe_id: emp.id, date: toISO(jour) })}
                                        >
                                            {/* Badges des tâches assignées */}
                                            {tachesDuJour.map((t) => (
                                                <span
                                                    key={t.id}
                                                    title="Cliquer pour retirer"
                                                    onClick={(e) => { e.stopPropagation(); retirerTache(emp.id, jour, t.id); }}
                                                    style={{
                                                        display: "inline-block",
                                                        margin: "2px",
                                                        padding: "2px 7px",
                                                        borderRadius: "10px",
                                                        fontSize: "11px",
                                                        background: t.couleur_tache?.couleur || "#e5e7eb",
                                                        color: "#fff",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {t.nomTache} ✕
                                                </span>
                                            ))}
                                            {/* Bouton + si aucune tâche */}
                                            {tachesDuJour.length === 0 && (
                                                <span style={{ color: "#d1d5db", fontSize: "18px" }}>+</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        {employes.length === 0 && (
                            <tr><td colSpan={8} style={{ textAlign: "center", color: "#9ca3af", padding: "20px" }}>Aucun employé dans ce magasin.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Section catalogue de tâches ── */}
            <details style={{ marginTop: "32px" }}>
                <summary style={{ cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}>
                    ⚙️ Catalogue de tâches ({taches.length})
                </summary>
                <div style={{ marginTop: "12px", display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "flex-start" }}>

                    {/* Liste des tâches existantes */}
                    <div style={{ flex: 1, minWidth: "200px" }}>
                        {taches.map((t) => (
                            <span key={t.id} style={{ display: "inline-block", margin: "4px", padding: "4px 10px", borderRadius: "12px", background: t.couleur_tache?.couleur || "#e5e7eb", color: "#fff", fontSize: "13px" }}>
                                {t.nomTache}
                            </span>
                        ))}
                    </div>

                    {/* Formulaire nouvelle tâche */}
                    <form onSubmit={creerTache} style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "220px" }}>
                        <strong>Nouvelle tâche</strong>
                        {msgTache && <p style={{ margin: 0, color: msgTache.includes("!") ? "green" : "crimson", fontSize: "13px" }}>{msgTache}</p>}
                        <input placeholder="Nom de la tâche" value={formTache.nomTache} onChange={(e) => setFormTache({ ...formTache, nomTache: e.target.value })} required style={inputStyle} />
                        <select value={formTache.couleur_tache_id} onChange={(e) => setFormTache({ ...formTache, couleur_tache_id: e.target.value })} required style={inputStyle}>
                            <option value="">-- Couleur / priorité --</option>
                            {couleurs.map((c) => (
                                <option key={c.id} value={c.id}>{c.nomCouleurRep} ({c.couleur})</option>
                            ))}
                        </select>
                        <button type="submit" style={btnVert}>+ Créer</button>
                    </form>
                </div>
            </details>

            <button onClick={() => navigate("/acceuil")} style={{ marginTop: "30px", padding: "8px 20px", cursor: "pointer" }}>
                ← Retour
            </button>

            {/* ── Modal : choisir une tâche à assigner ── */}
            {modal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                    <div style={{ background: "#fff", borderRadius: "10px", padding: "24px", minWidth: "280px", maxWidth: "360px" }}>
                        <h3 style={{ marginTop: 0 }}>Choisir une tâche</h3>
                        <p style={{ color: "#6b7280", fontSize: "13px", marginTop: 0 }}>
                            {employes.find((e) => e.id === modal.employe_id)?.prenomEmploye} — {modal.date}
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                            {taches.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => assignerTache(t.id)}
                                    style={{ padding: "6px 14px", borderRadius: "12px", border: "none", background: t.couleur_tache?.couleur || "#e5e7eb", color: "#fff", cursor: "pointer", fontSize: "13px" }}
                                >
                                    {t.nomTache}
                                </button>
                            ))}
                            {taches.length === 0 && <p style={{ color: "#9ca3af" }}>Aucune tâche dans le catalogue.</p>}
                        </div>
                        <button onClick={() => setModal(null)} style={{ padding: "6px 16px", cursor: "pointer" }}>Annuler</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const thStyle   = { padding: "10px 8px", background: "#f1f5f9", border: "1px solid #e2e8f0", textAlign: "center", whiteSpace: "nowrap" };
const tdStyle   = { padding: "8px", border: "1px solid #e2e8f0", verticalAlign: "top", textAlign: "center" };
const btnNav    = { padding: "6px 14px", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", background: "#f8fafc" };
const btnVert   = { padding: "6px 14px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" };
const inputStyle = { padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" };

