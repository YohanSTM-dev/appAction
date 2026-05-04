import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api";

// Noms des mois pour l'affichage
const NOMS_MOIS = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export default function CoffreFort() {
    const navigate = useNavigate();

    // Récupération de l'employé connecté
    const employe = JSON.parse(localStorage.getItem("employeConnecte") || "null");

    const [fiches, setFiches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState("");

    // Chargement des fiches de paie de l'employé au montage
    useEffect(() => {
        if (!employe?.id) return;

        const chargerFiches = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/paie/fiches/${employe.id}`);
                const data = await res.json();
                setFiches(Array.isArray(data) ? data : []);
            } catch {
                setErreur("Impossible de charger les fiches de paie.");
            } finally {
                setLoading(false);
            }
        };

        chargerFiches();
    }, [employe?.id]);

    // Génère et déclenche le téléchargement d'une fiche de paie en format texte
    const telechargerFiche = (fiche) => {
        // Construction du contenu de la fiche de paie
        const contenu = [
            "===========================================",
            "           FICHE DE PAIE",
            "===========================================",
            "",
            `Employé       : ${employe.prenomEmploye} ${employe.nomEmploye}`,
            `Matricule     : ${employe.matriculeEmploye}`,
            `Email         : ${employe.emailEmploye}`,
            "",
            `Période       : ${NOMS_MOIS[fiche.mois]} ${fiche.annee}`,
            "",
            "-------------------------------------------",
            `Heures travaillées      : ${fiche.heuresTravaillees ?? "—"} h`,
            `Heures supplémentaires  : ${fiche.heuresSupplementaires ?? "—"} h`,
            `Montant net             : ${fiche.montantNet ? `${fiche.montantNet} €` : "—"}`,
            "-------------------------------------------",
            "",
            `Document généré le : ${new Date().toLocaleDateString("fr-FR")}`,
            "===========================================",
        ].join("\n");

        // Création d'un Blob et déclenchement du téléchargement
        const blob = new Blob([contenu], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const lien = document.createElement("a");
        lien.href = url;
        lien.download = `fiche-paie-${NOMS_MOIS[fiche.mois]}-${fiche.annee}.txt`;
        document.body.appendChild(lien);
        lien.click();

        // Nettoyage de l'URL temporaire après le téléchargement
        document.body.removeChild(lien);
        URL.revokeObjectURL(url);
    };

    if (!employe) {
        return <p>Non connecté. <button onClick={() => navigate("/login")}>Se connecter</button></p>;
    }

    return (
        <div style={{ maxWidth: "800px", margin: "40px auto", fontFamily: "sans-serif" }}>
            <button onClick={() => navigate("/acceuil")} style={btnSecondaire}>← Retour</button>

            <h1>🗄️ Coffre-Fort Numérique</h1>
            <p>Retrouvez ici toutes vos fiches de paie. Cliquez sur <strong>Télécharger</strong> pour les sauvegarder.</p>

            {erreur && <p style={{ color: "crimson" }}>{erreur}</p>}

            {loading ? (
                <p>Chargement de vos fiches...</p>
            ) : fiches.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", background: "#f9fafb", borderRadius: "8px", border: "1px dashed #ccc" }}>
                    <p style={{ color: "#6b7280" }}>Aucune fiche de paie disponible pour le moment.</p>
                    <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Vos fiches apparaîtront ici une fois générées par votre service RH.</p>
                </div>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "#f0f0f0" }}>
                            <th style={th}>Période</th>
                            <th style={th}>Heures travaillées</th>
                            <th style={th}>Heures sup.</th>
                            <th style={th}>Montant net</th>
                            <th style={th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fiches.map((f) => (
                            <tr key={f.id}>
                                <td style={td}><strong>{NOMS_MOIS[f.mois]} {f.annee}</strong></td>
                                <td style={td}>{f.heuresTravaillees != null ? `${f.heuresTravaillees} h` : "—"}</td>
                                <td style={{ ...td, color: f.heuresSupplementaires > 0 ? "#f59e0b" : "inherit" }}>
                                    {f.heuresSupplementaires != null ? `${f.heuresSupplementaires} h` : "—"}
                                </td>
                                <td style={{ ...td, fontWeight: "bold" }}>
                                    {f.montantNet != null ? `${parseFloat(f.montantNet).toFixed(2)} €` : "—"}
                                </td>
                                <td style={td}>
                                    <button
                                        onClick={() => telechargerFiche(f)}
                                        style={btnPrimaire}
                                    >
                                        ⬇ Télécharger
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

const btnSecondaire = { padding: "6px 14px", background: "#e5e7eb", border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "16px" };
const btnPrimaire = { padding: "4px 12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };
const th = { padding: "8px 12px", borderBottom: "2px solid #ddd", textAlign: "left" };
const td = { padding: "8px 12px", borderBottom: "1px solid #eee" };
