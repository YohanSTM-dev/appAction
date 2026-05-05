import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api";

export default function GestionConges() {
    const navigate = useNavigate();

    const [conges, setConges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState("");

    // Filtre par statut (All / En attente / Validé / Refusé)
    const [filtre, setFiltre] = useState("En attente");

    // Chargement de toutes les demandes de congé au montage
    useEffect(() => {
        const chargerConges = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/conges`);
                const data = await res.json();
                setConges(Array.isArray(data) ? data : []);
            } catch {
                setErreur("Impossible de charger les demandes de congé.");
            } finally {
                setLoading(false);
            }
        };

        chargerConges();
    }, []);

    // Valider ou refuser un congé
    const changerStatut = async (id, statut) => {
        try {
            const res = await fetch(`${API_BASE_URL}/conges/${id}/statut`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ statut }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.error || "Erreur lors de la mise à jour.");
            }

            // Mise à jour locale de la liste sans rechargement réseau
            setConges((prev) =>
                prev.map((c) => (c.id === id ? { ...c, statut } : c))
            );
        } catch (error) {
            alert(error.message || "Une erreur est survenue.");
        }
    };

    // Filtrage des résultats selon le statut sélectionné
    const congesFiltres = filtre === "Tous"
        ? conges
        : conges.filter((c) => c.statut === filtre);

    return (
        <div style={{ maxWidth: "900px", margin: "40px auto", fontFamily: "sans-serif" }}>
            <button onClick={() => navigate("/direction")} style={btnSecondaire}>← Retour direction</button>

            <h1>Gestion des congés</h1>

            {/* Sélecteur de filtre par statut */}
            <div style={{ marginBottom: "16px", display: "flex", gap: "8px" }}>
                {["En attente", "Validé", "Refusé", "Tous"].map((s) => (
                    <button
                        key={s}
                        onClick={() => setFiltre(s)}
                        style={{
                            ...btnStatut,
                            background: filtre === s ? "#3b82f6" : "#e5e7eb",
                            color: filtre === s ? "#fff" : "#333",
                        }}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {erreur && <p style={{ color: "crimson" }}>{erreur}</p>}

            {loading ? (
                <p>Chargement des demandes...</p>
            ) : congesFiltres.length === 0 ? (
                <p>Aucune demande avec ce statut.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "#f0f0f0" }}>
                            <th style={th}>Employé</th>
                            <th style={th}>Du</th>
                            <th style={th}>Au</th>
                            <th style={th}>Motif</th>
                            <th style={th}>Statut</th>
                            <th style={th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {congesFiltres.map((c) => (
                            <tr key={c.id}>
                                <td style={td}>
                                    {c.employe
                                        ? `${c.employe.prenomEmploye} ${c.employe.nomEmploye}`
                                        : `Employé #${c.employe_id}`}
                                </td>
                                <td style={td}>{c.dateDebut}</td>
                                <td style={td}>{c.dateFin}</td>
                                <td style={td}>{c.motif || "—"}</td>
                                <td style={{ ...td, color: couleurStatut(c.statut), fontWeight: "bold" }}>
                                    {c.statut}
                                </td>
                                <td style={td}>
                                    {/* Les boutons n'apparaissent que si le congé est encore En attente */}
                                    {c.statut === "En attente" ? (
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <button
                                                onClick={() => changerStatut(c.id, "Validé")}
                                                style={btnValider}
                                            >
                                                ✓ Valider
                                            </button>
                                            <button
                                                onClick={() => changerStatut(c.id, "Refusé")}
                                                style={btnRefuser}
                                            >
                                                ✗ Refuser
                                            </button>
                                        </div>
                                    ) : (
                                        <span style={{ color: "#999", fontSize: "0.85rem" }}>Traité</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

const couleurStatut = (statut) => {
    if (statut === "Validé") return "green";
    if (statut === "Refusé") return "crimson";
    return "orange";
};

const btnSecondaire = { padding: "6px 14px", background: "#e5e7eb", border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "16px" };
const btnStatut = { padding: "6px 14px", border: "none", borderRadius: "4px", cursor: "pointer" };
const btnValider = { padding: "4px 10px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };
const btnRefuser = { padding: "4px 10px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };
const th = { padding: "8px 12px", borderBottom: "2px solid #ddd", textAlign: "left" };
const td = { padding: "8px 12px", borderBottom: "1px solid #eee" };
