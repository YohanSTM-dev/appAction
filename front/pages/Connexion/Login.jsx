import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api";
 
export default function Login(){
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [erreur, setErreur] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErreur("");
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/employes/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emailEmploye: email.trim(),
                    mdpEmploye: password,
                    
                }),
            });

            

            const data = await response.json().catch(() => ({}));

            // DEBUG : affiche la réponse complète de l'API dans la console du navigateur
            console.log("Réponse API login :", data);

            if (!response.ok) {
                throw new Error(data?.error || "Connexion impossible.");
            }

            if (data?.employe) {
                localStorage.setItem("employeConnecte", JSON.stringify(data.employe));
            }

            // Redirection selon le rôle : Admin → espace direction, sinon → accueil employé
            const roles = data?.employe?.roles || [];
            const estAdmin = roles.some((r) => r.toLowerCase().includes("admin"));
            navigate(estAdmin ? "/direction" : "/acceuil");
        } catch (error) {
            setErreur(error?.message || "Erreur lors de la connexion.");
        } finally {
            setLoading(false);
        }
    };
    



    return(
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Page de connexion</h1>
            <p>Connecte-toi avec ton email et ton mot de passe.</p>

            {erreur && <p style={{ color: "crimson" }}>{erreur}</p>}

            <form
                onSubmit={handleSubmit}
                className="form-containerInscription"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    maxWidth: "360px",
                    margin: "0 auto",
                    gap: "10px",
                }}
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
                <button type="submit" disabled={loading}>
                    {loading ? "Connexion..." : "Se connecter"}
                </button>
            </form>
        </div>
    )
}

