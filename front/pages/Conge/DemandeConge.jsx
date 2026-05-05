import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api";

export default function DemandeConge() {
    const navigate = useNavigate();

    // Récupération de l'employé connecté depuis le localStorage
    const employe = JSON.parse(localStorage.getItem("employeConnecte") || "null");

    const [dateDebut, setDateDebut] = useState("");
    const [dateFin, setDateFin] = useState("");
    const [motif, setMotif] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [erreur, setErreur] = useState("");

    // Liste des congés existants de l'employé
    const [conges, setConges] = useState([]);
    const [loadingConges, setLoadingConges] = useState(true);

    // Chargement des congés de l'employé au montage du composant
    useEffect(() => {
        if (!employe?.id) return;

        const chargerConges = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/conges/employe/${employe.id}`);
                const data = await res.json();
                setConges(Array.isArray(data) ? data : []);
            } catch {
                setConges([]);
            } finally {
                setLoadingConges(false);
            }
        };

        chargerConges();
    }, [employe?.id]);

    // Soumission d'une nouvelle demande de congé
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErreur("");
        setMessage("");
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/conges`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dateDebut,
                    dateFin,
                    motif,
                    employe_id: employe.id,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.error || "Erreur lors de la soumission.");
            }

            setMessage("Demande envoyée avec succès ! Statut : En attente.");
            setDateDebut("");
            setDateFin("");
            setMotif("");

            // Rafraîchir la liste des congés
            setConges((prev) => [data, ...prev]);
        } catch (error) {
            setErreur(error.message || "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    if (!employe) {
        return <p>Non connecté. <button onClick={() => navigate("/login")}>Se connecter</button></p>;
    }

    return (
        <div style={{ maxWidth: "700px", margin: "40px auto", fontFamily: "sans-serif" }}>
            <button onClick={() => navigate("/acceuil")} style={btnSecondaire}>← Retour</button>

            <h1>Demande de congé</h1>
            <p>Bonjour <strong>{employe.prenomEmploye} {employe.nomEmploye}</strong>, soumettez votre demande ci-dessous.</p>

            {message && <p style={{ color: "green", padding: "8px", background: "#efffef", borderRadius: "4px" }}>{message}</p>}
            {erreur && <p style={{ color: "crimson", padding: "8px", background: "#fff0f0", borderRadius: "4px" }}>{erreur}</p>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px" }}>
                <label>
                    Date de début
                    <input
                        type="date"
                        value={dateDebut}
                        onChange={(e) => setDateDebut(e.target.value)}
                        required
                        style={inputStyle}
                    />
                </label>
                <label>
                    Date de fin
                    <input
                        type="date"
                        value={dateFin}
                        onChange={(e) => setDateFin(e.target.value)}
                        required
                        style={inputStyle}
                    />
                </label>
                <label>
                    Motif (optionnel)
                    <textarea
                        value={motif}
                        onChange={(e) => setMotif(e.target.value)}
                        rows={3}
                        placeholder="Congés payés, raison personnelle..."
                        style={{ ...inputStyle, resize: "vertical" }}
                    />
                </label>
                <button type="submit" disabled={loading} style={btnPrimaire}>
                    {loading ? "Envoi en cours..." : "Soumettre la demande"}
                </button>
            </form>

            <h2>Mes demandes</h2>
            {loadingConges ? (
                <p>Chargement...</p>
            ) : conges.length === 0 ? (
                <p>Aucune demande de congé pour l'instant.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "#f0f0f0" }}>
                            <th style={th}>Du</th>
                            <th style={th}>Au</th>
                            <th style={th}>Motif</th>
                            <th style={th}>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {conges.map((c) => (
                            <tr key={c.id}>
                                <td style={td}>{c.dateDebut}</td>
                                <td style={td}>{c.dateFin}</td>
                                <td style={td}>{c.motif || "—"}</td>
                                <td style={{ ...td, color: couleurStatut(c.statut), fontWeight: "bold" }}>
                                    {c.statut}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

// Couleur selon le statut du congé
const couleurStatut = (statut) => {
    if (statut === "Validé") return "green";
    if (statut === "Refusé") return "crimson";
    return "orange";
};

const inputStyle = { display: "block", width: "100%", padding: "8px", marginTop: "4px", boxSizing: "border-box" };
const btnPrimaire = { padding: "10px 20px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };
const btnSecondaire = { padding: "6px 14px", background: "#e5e7eb", border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "16px" };
const th = { padding: "8px 12px", borderBottom: "2px solid #ddd", textAlign: "left" };
const td = { padding: "8px 12px", borderBottom: "1px solid #eee" };
