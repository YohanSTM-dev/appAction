import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export default function EspaceRH() {
    const navigate = useNavigate();

    // ── Données chargées depuis le backend ────────────────────────────
    const [employes, setEmployes] = useState([]);
    const [magasins, setMagasins] = useState([]);
    const [contrats, setContrats] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);

    // ── Onglet actif : "employes" ou "contrats" ───────────────────────
    const [onglet, setOnglet] = useState("employes");

    // ── Formulaire nouveau contrat ────────────────────────────────────
    const [formContrat, setFormContrat] = useState({ nomTypeContrat: "", heureContrat: "" });
    const [msgContrat, setMsgContrat] = useState("");

    // ── Employé en cours de modification ─────────────────────────────
    const [editId, setEditId] = useState(null);       // id de la ligne en édition
    const [editData, setEditData] = useState({});     // données du formulaire inline
    const [msgEdit, setMsgEdit] = useState("");

    // ── Chargement initial ────────────────────────────────────────────
    useEffect(() => {
        const charger = async () => {
            setChargement(true);
            setErreur(null);
            try {
                const [repEmp, repMag, repCont] = await Promise.all([
                    fetch(`${API_BASE_URL}/employes/details`),
                    fetch(`${API_BASE_URL}/magasins`),
                    fetch(`${API_BASE_URL}/typeContrats`),
                ]);
                setEmployes(repEmp.ok ? await repEmp.json() : []);
                setMagasins(repMag.ok ? await repMag.json() : []);
                setContrats(repCont.ok ? await repCont.json() : []);
            } catch (err) {
                setErreur("Impossible de charger les données.");
            } finally {
                setChargement(false);
            }
        };
        charger();
    }, []);

    // ── Ouvrir le formulaire d'édition pour un employé ────────────────
    const ouvrirEdition = (emp) => {
        setEditId(emp.id);
        setEditData({
            nomEmploye: emp.nomEmploye || "",
            prenomEmploye: emp.prenomEmploye || "",
            emailEmploye: emp.emailEmploye || "",
            magasin_id: emp.magasin_id ?? "",
            type_contrat_id: emp.type_contrat_id ?? "",
            date_embauche: emp.date_embauche ?? "",
        });
        setMsgEdit("");
    };

    // ── Sauvegarder les modifications d'un employé ────────────────────
    const sauvegarderEdition = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/employes/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...editData,
                    magasin_id: editData.magasin_id ? Number(editData.magasin_id) : null,
                    type_contrat_id: editData.type_contrat_id ? Number(editData.type_contrat_id) : null,
                }),
            });
            if (!response.ok) throw new Error("Erreur lors de la sauvegarde.");

            // Mise à jour locale : on rafraîchit la liste complète pour avoir les détails à jour
            const repEmp = await fetch(`${API_BASE_URL}/employes/details`);
            setEmployes(repEmp.ok ? await repEmp.json() : []);

            setEditId(null);
            setMsgEdit("Modifié avec succès !");
            setTimeout(() => setMsgEdit(""), 3000);
        } catch (err) {
            setMsgEdit(err.message);
        }
    };

    // ── Créer un nouveau type de contrat ──────────────────────────────
    const creerContrat = async (e) => {
        e.preventDefault();
        setMsgContrat("");
        try {
            const response = await fetch(`${API_BASE_URL}/typeContrats`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nomTypeContrat: formContrat.nomTypeContrat,
                    heureContrat: formContrat.heureContrat,
                }),
            });
            if (!response.ok) throw new Error("Erreur lors de la création.");
            const nouveau = await response.json();
            setContrats((prev) => [...prev, nouveau]);
            setFormContrat({ nomTypeContrat: "", heureContrat: "" });
            setMsgContrat("Contrat créé avec succès !");
        } catch (err) {
            setMsgContrat(err.message);
        }
    };

    if (chargement) return <p style={{ textAlign: "center", marginTop: "40px" }}>Chargement...</p>;

    return (
        <div style={{ maxWidth: "1100px", margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
            <h1>Espace RH</h1>

            {erreur && <p style={{ color: "crimson" }}>{erreur}</p>}
            {msgEdit && <p style={{ color: "green" }}>{msgEdit}</p>}

            {/* ── Onglets ── */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
                <button onClick={() => setOnglet("employes")} style={onglet === "employes" ? btnActif : btnInactif}>
                    👥 Employés ({employes.length})
                </button>
                <button onClick={() => setOnglet("contrats")} style={onglet === "contrats" ? btnActif : btnInactif}>
                    📄 Types de contrats ({contrats.length})
                </button>
            </div>

            {/* ════════════════════════════════════════════════════════
                ONGLET EMPLOYÉS
            ════════════════════════════════════════════════════════ */}
            {onglet === "employes" && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "#f1f5f9" }}>
                            <th style={th}>Nom / Prénom</th>
                            <th style={th}>Email</th>
                            <th style={th}>Embauche</th>
                            <th style={th}>Magasin</th>
                            <th style={th}>Contrat</th>
                            <th style={th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employes.map((emp) =>
                            editId === emp.id ? (
                                // ── Ligne en mode édition ──
                                <tr key={emp.id} style={{ background: "#fffbeb" }}>
                                    <td style={td}>
                                        <input value={editData.nomEmploye} onChange={(e) => setEditData({ ...editData, nomEmploye: e.target.value })} style={inputStyle} placeholder="Nom" />
                                        <input value={editData.prenomEmploye} onChange={(e) => setEditData({ ...editData, prenomEmploye: e.target.value })} style={{ ...inputStyle, marginTop: "4px" }} placeholder="Prénom" />
                                    </td>
                                    <td style={td}>
                                        <input type="email" value={editData.emailEmploye} onChange={(e) => setEditData({ ...editData, emailEmploye: e.target.value })} style={inputStyle} />
                                    </td>
                                    <td style={td}>
                                        <input type="date" value={editData.date_embauche} onChange={(e) => setEditData({ ...editData, date_embauche: e.target.value })} style={inputStyle} />
                                    </td>
                                    <td style={td}>
                                        {/* Liste déroulante des magasins */}
                                        <select value={editData.magasin_id} onChange={(e) => setEditData({ ...editData, magasin_id: e.target.value })} style={inputStyle}>
                                            <option value="">-- Aucun --</option>
                                            {magasins.map((m) => (
                                                <option key={m.id} value={m.id}>{m.ville} - {m.rue}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td style={td}>
                                        {/* Liste déroulante des contrats */}
                                        <select value={editData.type_contrat_id} onChange={(e) => setEditData({ ...editData, type_contrat_id: e.target.value })} style={inputStyle}>
                                            <option value="">-- Aucun --</option>
                                            {contrats.map((c) => (
                                                <option key={c.id} value={c.id}>{c.nomTypeContrat} ({c.heureContrat}h)</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td style={td}>
                                        <button onClick={() => sauvegarderEdition(emp.id)} style={btnVert}>✓ Sauvegarder</button>
                                        <button onClick={() => setEditId(null)} style={{ ...btnGris, marginTop: "4px" }}>✕ Annuler</button>
                                    </td>
                                </tr>
                            ) : (
                                // ── Ligne normale ──
                                <tr key={emp.id}>
                                    <td style={td}><strong>{emp.prenomEmploye} {emp.nomEmploye}</strong><br /><small style={{ color: "#6b7280" }}>{emp.matriculeEmploye}</small></td>
                                    <td style={td}>{emp.emailEmploye ?? "—"}</td>
                                    <td style={td}>{emp.date_embauche ?? "—"}</td>
                                    <td style={td}>{emp.magasin ? `${emp.magasin.ville}` : <span style={{ color: "#f59e0b" }}>Non affecté</span>}</td>
                                    <td style={td}>{emp.type_contrat ? `${emp.type_contrat.nomTypeContrat} (${emp.type_contrat.heureContrat}h)` : <span style={{ color: "#f59e0b" }}>Aucun</span>}</td>
                                    <td style={td}>
                                        <button onClick={() => ouvrirEdition(emp)} style={btnBleu}>✏️ Modifier</button>
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            )}

            {/* ════════════════════════════════════════════════════════
                ONGLET TYPES DE CONTRATS
            ════════════════════════════════════════════════════════ */}
            {onglet === "contrats" && (
                <div>
                    {/* Formulaire de création */}
                    <section style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", maxWidth: "400px", marginBottom: "24px" }}>
                        <h2 style={{ marginTop: 0 }}>Nouveau type de contrat</h2>
                        {msgContrat && <p style={{ color: msgContrat.includes("succès") ? "green" : "crimson" }}>{msgContrat}</p>}
                        <form onSubmit={creerContrat} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <input
                                placeholder="Nom (ex: CDI, CDD, Alternance)"
                                value={formContrat.nomTypeContrat}
                                onChange={(e) => setFormContrat({ ...formContrat, nomTypeContrat: e.target.value })}
                                required
                                style={inputStyle}
                            />
                            <input
                                placeholder="Heures par semaine (ex: 35)"
                                value={formContrat.heureContrat}
                                onChange={(e) => setFormContrat({ ...formContrat, heureContrat: e.target.value })}
                                required
                                style={inputStyle}
                            />
                            <button type="submit" style={btnVert}>Créer</button>
                        </form>
                    </section>

                    {/* Liste des contrats existants */}
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f1f5f9" }}>
                                <th style={th}>Nom</th>
                                <th style={th}>Heures / semaine</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contrats.map((c) => (
                                <tr key={c.id}>
                                    <td style={td}>{c.nomTypeContrat}</td>
                                    <td style={td}>{c.heureContrat}h</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <button onClick={() => navigate("/acceuil")} style={{ marginTop: "30px", padding: "8px 20px", cursor: "pointer" }}>
                ← Retour à l'accueil
            </button>
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const th = { padding: "10px 12px", textAlign: "left", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" };
const td = { padding: "8px 12px", borderBottom: "1px solid #f1f5f9", verticalAlign: "top" };
const inputStyle = { width: "100%", padding: "4px 8px", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "4px" };
const btnActif  = { padding: "8px 20px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
const btnInactif = { padding: "8px 20px", background: "#e2e8f0", color: "#374151", border: "none", borderRadius: "6px", cursor: "pointer" };
const btnVert   = { display: "block", width: "100%", padding: "4px 10px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "2px" };
const btnBleu   = { padding: "4px 10px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };
const btnGris   = { display: "block", width: "100%", padding: "4px 10px", background: "#94a3b8", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };
