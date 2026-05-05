import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRedirectionApresLogin } from "../../src/utils/roles.js";

// Adresse du serveur backend
const API_BASE_URL = "http://localhost:5000/api";

export default function Login() {
    // Hook React Router pour naviguer entre les pages
    const navigate = useNavigate();

    // États locaux du formulaire
    const [email, setEmail] = useState("");       // email saisi
    const [password, setPassword] = useState(""); // mot de passe saisi
    const [loading, setLoading] = useState(false); // true pendant la requête
    const [erreur, setErreur] = useState("");      // message d'erreur à afficher

    // Appelé quand l'utilisateur clique sur "Se connecter"
    const handleSubmit = async (e) => {
        e.preventDefault(); // empêche le rechargement de la page
        setErreur("");
        setLoading(true);

        try {
            // Appel API POST /employes/login avec email + mot de passe
            const response = await fetch(`${API_BASE_URL}/employes/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emailEmploye: email.trim(),
                    mdpEmploye: password,
                }),
            });

            // On lit la réponse JSON renvoyée par le backend
            const data = await response.json().catch(() => ({}));

            // Si le backend répond avec un code erreur (4xx, 5xx)
            if (!response.ok) {
                throw new Error(data?.error || "Connexion impossible.");
            }

            // On sauvegarde l'employé connecté dans le localStorage
            // → il sera accessible sur toutes les pages tant qu'on ne se déconnecte pas
            if (data?.employe) {
                localStorage.setItem("employeConnecte", JSON.stringify(data.employe));
            }

            // Redirection intelligente selon le rôle le plus élevé :
            // Admin → /direction | RH → /rh | Manager → /planning/gestion | Employé → /acceuil
            const roles = data?.employe?.roles || [];
            navigate(getRedirectionApresLogin(roles));

        } catch (error) {
            // Affiche le message d'erreur sous le formulaire
            setErreur(error?.message || "Erreur lors de la connexion.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Page de connexion</h1>
            <p>Connecte-toi avec ton email et ton mot de passe.</p>

            {/* Affiche le message d'erreur si présent */}
            {erreur && <p style={{ color: "crimson" }}>{erreur}</p>}

            <form
                onSubmit={handleSubmit}
                className="form-containerInscription"
                style={{ display: "flex", flexDirection: "column", maxWidth: "360px", margin: "0 auto", gap: "10px" }}
            >
                <input
                    type="email"
                    placeholder="Email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {/* Le bouton est désactivé pendant la requête pour éviter les double-envois */}
                <button type="submit" disabled={loading}>
                    {loading ? "Connexion..." : "Se connecter"}
                </button>
            </form>
        </div>
    );
}

