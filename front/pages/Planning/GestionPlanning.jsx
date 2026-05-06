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

// Formate une date en "YYYY-MM-DD" en heure locale (évite le décalage UTC)
const toISO = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

// Formate une date en " ex Lun 4 mai" (pour l'affichage)
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

    // ── Vue détail d'un jour (click sur en-tête de colonne) ───────────
    const [jourDetail, setJourDetail] = useState(null); // { date: "YYYY-MM-DD", label: "Lun 6 mai" }

    // ── Formulaire nouvelle tâche ─────────────────────────────────────
    const [formTache, setFormTache] = useState({ nomTache: "", couleur_tache_id: "" });
    const [msgTache, setMsgTache]   = useState("");

    // ── Formulaire nouvelle couleur ───────────────────────────────────
    const [nomCouleur, setNomCouleur]   = useState("");
    const [codeCouleur, setCodeCouleur] = useState("#000000");
    const [msgCouleur, setMsgCouleur]   = useState("");

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

    // ── Retourne les employés d'un jour répartis par créneau ──────────
    const getEmployesDuJour = (dateStr) => {
        const matin = [];
        const soir  = [];
        const repos = [];
        employes.forEach((emp) => {
            const planning = plannings.find(
                (p) => p.employe?.id === emp.id && p.dateDebut === dateStr
            );
            if (!planning) repos.push({ emp });
            else if (planning.creneau === "soir") soir.push({ emp, planning });
            else matin.push({ emp, planning }); // matin ou non défini
        });
        return { matin, soir, repos };
    };

    // ── Assigner un créneau ou une tâche (depuis le modal) ─────────────
    const assignerTache = async (tacheId, creneauOverride) => {
        if (!modal) return;
        const creneauFinal = creneauOverride ?? modal.creneau ?? null;
        try {
            const rep = await fetch(`${API_BASE_URL}/plannings/assigner-tache`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employe_id: modal.employe_id, date: modal.date, tache_id: tacheId, creneau: creneauFinal }),
            });
            if (!rep.ok) {
                const err = await rep.json().catch(() => ({}));
                setErreur(err.error || "Erreur lors de l'assignation.");
                return;
            }
            const repPlan = await fetch(`${API_BASE_URL}/plannings/magasin/${magasinId}/semaine?debut=${toISO(lundi)}`);
            setPlannings(repPlan.ok ? await repPlan.json() : []);
            setModal(null);
        } catch { setErreur("Erreur réseau : le serveur est injoignable."); }
    };

    // ── Retirer le créneau (repos) ────────────────────────────────────
    const supprimerCreneau = async () => {
        if (!modal) return;
        try {
            await fetch(`${API_BASE_URL}/plannings/retirer-tache`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employe_id: modal.employe_id, date: modal.date, tache_id: null }),
            });
            const rep = await fetch(`${API_BASE_URL}/plannings/magasin/${magasinId}/semaine?debut=${toISO(lundi)}`);
            setPlannings(rep.ok ? await rep.json() : []);
            setModal(null);
        } catch { setErreur("Erreur lors de la suppression du créneau."); }
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

    // ── Créer une nouvelle couleur ──────────────────────────────────
    const creerCouleur = async (e) => {
        e.preventDefault();
        setMsgCouleur("");
        try {
            const rep = await fetch(`${API_BASE_URL}/taches/couleurs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nomCouleurRep: nomCouleur, couleur: codeCouleur }),
            });
            if (!rep.ok) {
                const errData = await rep.json().catch(() => ({}));
                throw new Error(errData?.error || `Erreur ${rep.status}`);
            }
            const nouvelle = await rep.json();
            // Recharge la liste des couleurs
            const repCouleurs = await fetch(`${API_BASE_URL}/taches/couleurs`);
            setCouleurs(repCouleurs.ok ? await repCouleurs.json() : []);
            setNomCouleur("");
            setCodeCouleur("#000000");
            setMsgCouleur(`Couleur "${nouvelle.nomCouleurRep}" créée !`);
        } catch (err) { setMsgCouleur(err.message); }
    };

    if (chargement) return <p style={{ textAlign: "center", marginTop: "40px" }}>Chargement...</p>;

    return (
        <div style={{ maxWidth: "1200px", margin: "30px auto", fontFamily: "sans-serif", padding: "0 12px" }}>
            <h1 style={{ marginBottom: "4px" }}>Planning du magasin</h1>
            <p style={{ color: "#6b7280", marginTop: 0 }}>
                Cliquez sur une cellule pour changer le créneau. Cliquez sur un jour pour voir les tâches.
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
                                <th
                                    key={toISO(jour)}
                                    style={{ ...thStyle, cursor: "pointer" }}
                                    onClick={() => setJourDetail({ date: toISO(jour), label: toLabel(jour) })}
                                    title="Voir le détail de ce jour"
                                >
                                    {toLabel(jour)}
                                    <br />
                                    <span style={{ fontSize: "10px", color: "#E3001B", fontWeight: 400 }}>détail →</span>
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
                                    const dateStr = toISO(jour);
                                    const planningJour = plannings.find(p => p.employe?.id === emp.id && p.dateDebut === dateStr);
                                    const creneau = planningJour?.creneau ?? null;
                                    const bgCreneau = creneau === "matin" ? "#fef9c3" : creneau === "soir" ? "#ede9fe" : undefined;
                                    return (
                                        <td
                                            key={dateStr}
                                            style={{ ...tdStyle, cursor: "pointer", minWidth: "90px", background: bgCreneau }}
                                            onClick={() => setModal({ employe_id: emp.id, date: dateStr, creneau })}
                                        >
                                            {creneau === "matin" && <span style={badgeMatin}>Matin</span>}
                                            {creneau === "soir"  && <span style={badgeSoir}>Soir</span>}
                                            {!creneau && <span style={{ color: "#d1d5db", fontSize: "18px" }}>-</span>}
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
                    Catalogue de tâches ({taches.length})
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

                    {/* Formulaire nouvelle couleur */}
                    <form onSubmit={creerCouleur} style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "220px" }}>
                        <strong>Nouvelle couleur</strong>
                        {msgCouleur && <p style={{ margin: 0, color: msgCouleur.includes("!") ? "green" : "crimson", fontSize: "13px" }}>{msgCouleur}</p>}
                        <input placeholder="Nom (ex: Urgent)" value={nomCouleur} onChange={(e) => setNomCouleur(e.target.value)} required style={inputStyle} />
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <input type="color" value={codeCouleur} onChange={(e) => setCodeCouleur(e.target.value)} style={{ width: "40px", height: "34px", padding: "2px", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }} />
                            <span style={{ fontSize: "13px", color: "#6b7280" }}>{codeCouleur}</span>
                        </div>
                        <button type="submit" style={btnVert}>+ Créer</button>
                    </form>
                </div>
            </details>

            <button onClick={() => navigate("/acceuil")} style={{ marginTop: "30px", padding: "8px 20px", cursor: "pointer" }}>
                ← Retour
            </button>

            {/* ── Modal ── */}
            {modal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                    <div style={{ background: "#fff", borderRadius: "10px", padding: "24px", minWidth: "260px", maxWidth: "360px" }}>
                        <p style={{ color: "#6b7280", fontSize: "13px", marginTop: 0 }}>
                            {employes.find((e) => e.id === modal.employe_id)?.prenomEmploye} — {modal.date}
                        </p>

                        {/* Mode tâche (depuis le détail jour) */}
                        {modal.modeTache ? (
                            <>
                                <h3 style={{ marginTop: 0 }}>Choisir une tâche</h3>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                                    {taches.map((t) => (
                                        <button key={t.id} onClick={() => assignerTache(t.id)} style={{ padding: "6px 14px", borderRadius: "12px", border: "none", background: t.couleur_tache?.couleur || "#e5e7eb", color: "#fff", cursor: "pointer", fontSize: "13px" }}>
                                            {t.nomTache}
                                        </button>
                                    ))}
                                    {taches.length === 0 && <p style={{ color: "#9ca3af" }}>Aucune tâche dans le catalogue.</p>}
                                </div>
                            </>
                        ) : (
                            /* Mode créneau (depuis la grille) */
                            <>
                                <h3 style={{ marginTop: 0 }}>Créneau</h3>
                                <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                                    <button onClick={() => assignerTache(null, "matin")} style={{ flex: 1, padding: "10px", background: modal.creneau === "matin" ? "#d97706" : "#fef9c3", color: modal.creneau === "matin" ? "#fff" : "#92400e", border: "1px solid #d97706", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>Matin</button>
                                    <button onClick={() => assignerTache(null, "soir")}  style={{ flex: 1, padding: "10px", background: modal.creneau === "soir"  ? "#7c3aed" : "#ede9fe", color: modal.creneau === "soir"  ? "#fff" : "#4c1d95", border: "1px solid #7c3aed", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>Soir</button>
                                </div>
                                {modal.creneau && (
                                    <button onClick={() => supprimerCreneau()} style={{ width: "100%", marginBottom: "10px", padding: "8px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#374151", cursor: "pointer" }}>Retirer (repos)</button>
                                )}
                            </>
                        )}

                        <button onClick={() => setModal(null)} style={{ width: "100%", padding: "8px", cursor: "pointer", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", color: "#6b7280" }}>Annuler</button>
                    </div>
                </div>
            )}

            {/* ── Modal : détail d'un jour ── */}
            {jourDetail && (() => {
                const { matin, soir, repos } = getEmployesDuJour(jourDetail.date);
                return (
                    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
                        <div style={{ background: "#fff", borderRadius: "12px", padding: "28px", minWidth: "340px", maxWidth: "520px", width: "90%", maxHeight: "82vh", overflowY: "auto" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <h3 style={{ margin: 0 }}>{jourDetail.label}</h3>
                                <button onClick={() => setJourDetail(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280", padding: "0 4px" }}>✕</button>
                            </div>

                            {/* Matin */}
                            <div style={{ marginBottom: "20px" }}>
                                <div style={{ fontWeight: "700", color: "#92400e", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", padding: "4px 8px", background: "#fef9c3", borderRadius: "6px" }}>Matin — {matin.length} employé(s)</div>
                                {matin.length === 0 && <p style={{ color: "#9ca3af", fontSize: "13px", margin: "4px 0" }}>Aucun employé ce créneau.</p>}
                                {matin.map(({ emp, planning }) => (
                                    <div key={emp.id} style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", padding: "7px 0", borderBottom: "1px solid #f1f5f9" }}>
                                        <span style={{ fontWeight: "600", fontSize: "13px", minWidth: "130px" }}>{emp.prenomEmploye} {emp.nomEmploye}</span>
                                        {planning?.tache_id_TacheMags?.map(t => (
                                            <span key={t.id} onClick={() => retirerTache(emp.id, new Date(jourDetail.date + "T12:00:00"), t.id)} title="Retirer" style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "11px", background: t.couleur_tache?.couleur || "#e5e7eb", color: "#fff", cursor: "pointer" }}>{t.nomTache} ✕</span>
                                        ))}
                                        <button onClick={() => { setJourDetail(null); setModal({ employe_id: emp.id, date: jourDetail.date, creneau: "matin", modeTache: true }); }} style={{ padding: "2px 10px", fontSize: "11px", borderRadius: "8px", background: "#f59e0b", border: "none", color: "#fff", cursor: "pointer" }}>+ Tâche</button>
                                    </div>
                                ))}
                            </div>

                            {/* Soir */}
                            <div style={{ marginBottom: "20px" }}>
                                <div style={{ fontWeight: "700", color: "#4c1d95", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", padding: "4px 8px", background: "#ede9fe", borderRadius: "6px" }}>Soir — {soir.length} employé(s)</div>
                                {soir.length === 0 && <p style={{ color: "#9ca3af", fontSize: "13px", margin: "4px 0" }}>Aucun employé ce créneau.</p>}
                                {soir.map(({ emp, planning }) => (
                                    <div key={emp.id} style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", padding: "7px 0", borderBottom: "1px solid #f1f5f9" }}>
                                        <span style={{ fontWeight: "600", fontSize: "13px", minWidth: "130px" }}>{emp.prenomEmploye} {emp.nomEmploye}</span>
                                        {planning?.tache_id_TacheMags?.map(t => (
                                            <span key={t.id} onClick={() => retirerTache(emp.id, new Date(jourDetail.date + "T12:00:00"), t.id)} title="Retirer" style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "11px", background: t.couleur_tache?.couleur || "#e5e7eb", color: "#fff", cursor: "pointer" }}>{t.nomTache} ✕</span>
                                        ))}
                                        <button onClick={() => { setJourDetail(null); setModal({ employe_id: emp.id, date: jourDetail.date, creneau: "soir", modeTache: true }); }} style={{ padding: "2px 10px", fontSize: "11px", borderRadius: "8px", background: "#7c3aed", border: "none", color: "#fff", cursor: "pointer" }}>+ Tâche</button>
                                    </div>
                                ))}
                            </div>

                            {/* Repos */}
                            {repos.length > 0 && (
                                <div>
                                    <div style={{ fontWeight: "700", color: "#6b7280", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", padding: "4px 8px", background: "#f1f5f9", borderRadius: "6px" }}>Repos — {repos.length}</div>
                                    {repos.map(({ emp }) => (
                                        <div key={emp.id} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 0", borderBottom: "1px solid #f1f5f9" }}>
                                            <span style={{ fontWeight: "600", fontSize: "13px", minWidth: "130px", color: "#9ca3af" }}>{emp.prenomEmploye} {emp.nomEmploye}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button onClick={() => setJourDetail(null)} style={{ marginTop: "20px", width: "100%", padding: "8px", cursor: "pointer", background: "#f1f5f9", border: "none", borderRadius: "6px", color: "#374151" }}>Fermer</button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const thStyle    = { padding: "10px 8px", background: "#f1f5f9", border: "1px solid #e2e8f0", textAlign: "center", whiteSpace: "nowrap" };
const tdStyle    = { padding: "8px", border: "1px solid #e2e8f0", verticalAlign: "middle", textAlign: "center" };
const btnNav     = { padding: "6px 14px", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", background: "#f8fafc" };
const btnVert    = { padding: "6px 14px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" };
const inputStyle = { padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" };
const badgeMatin = { display: "inline-block", padding: "3px 10px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, background: "#d97706", color: "#fff" };
const badgeSoir  = { display: "inline-block", padding: "3px 10px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, background: "#7c3aed", color: "#fff" };

