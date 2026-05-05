import { useEffect, useState } from "react";

// Adresse du serveur backend
const API_BASE_URL = "http://localhost:5000/api";

export default function Register() {
  // ── Champs du formulaire ──────────────────────────────────────────
  const [nomEmploye, setNomEmploye] = useState("");
  const [prenomEmploye, setPrenomEmploye] = useState("");
  const [mdpEmploye, setMdpEmploye] = useState("");
  const [emailEmploye, setEmailEmploye] = useState("");
  const [dateEmbauche, setDateEmbauche] = useState("");
  const [magasinId, setMagasinId] = useState("");       // id du magasin sélectionné
  const [typeContratId, setTypeContratId] = useState(""); // id du contrat sélectionné

  // ── Données chargées depuis le backend pour remplir les <select> ──
  const [magasins, setMagasins] = useState([]);
  const [typeContrats, setTypeContrats] = useState([]);

  // ── États UI ──────────────────────────────────────────────────────
  const [erreurChargement, setErreurChargement] = useState(null); // erreur au chargement initial
  const [erreurSubmit, setErreurSubmit] = useState(null);         // erreur à l'envoi du formulaire
  const [envoiEnCours, setEnvoiEnCours] = useState(false);        // true pendant la requête POST

  // Chargement des magasins et contrats au montage du composant
  useEffect(() => {
    let cancelled = false; // évite les mises à jour si le composant est démonté entre temps

    const chargerDonnees = async () => {
      setErreurChargement(null);
      try {
        // On lance les deux requêtes en parallèle pour aller plus vite
        const [repMagasins, repContrats] = await Promise.all([
          fetch(`${API_BASE_URL}/magasins`),
          fetch(`${API_BASE_URL}/typeContrats`),
        ]);

        const magasinsJson = repMagasins.ok ? await repMagasins.json() : [];
        const contratsJson = repContrats.ok ? await repContrats.json() : [];

        if (cancelled) return;

        setMagasins(Array.isArray(magasinsJson) ? magasinsJson : []);
        setTypeContrats(Array.isArray(contratsJson) ? contratsJson : []);
      } catch (error) {
        if (cancelled) return;
        setErreurChargement(error?.message || "Erreur reseau.");
        setMagasins([]);
        setTypeContrats([]);
      }
    };

    chargerDonnees();
    return () => { cancelled = true; }; // nettoyage au démontage
  }, []); // [] = s'exécute une seule fois au premier affichage

  // Remet tous les champs à vide après une inscription réussie
  const resetForm = () => {
    setNomEmploye("");
    setPrenomEmploye("");
    setMdpEmploye("");
    setEmailEmploye("");
    setDateEmbauche("");
    setMagasinId("");
    setTypeContratId("");
  };

  // Appelé quand l'utilisateur clique sur "Inscrire l'employé"
  const handleSubmit = async (e) => {
    e.preventDefault(); // empêche le rechargement de la page
    setErreurSubmit(null);
    setEnvoiEnCours(true);

    // Objet envoyé au backend (POST /employes)
    const nouvelEmploye = {
      nomEmploye,
      prenomEmploye,
      mdpEmploye,
      emailEmploye,
      date_embauche: dateEmbauche || null,
      magasin_id: magasinId ? Number(magasinId) : null,
      type_contrat_id: typeContratId ? Number(typeContratId) : null,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/employes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nouvelEmploye),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }

      alert("Employe inscrit avec succes !");
      resetForm(); // on vide le formulaire pour une nouvelle saisie
    } catch (error) {
      setErreurSubmit(error?.message || "Erreur lors de l'inscription.");
      alert("Une erreur est survenue lors de l'inscription. Veuillez reessayer.");
    } finally {
      setEnvoiEnCours(false);
    }
  };

  return (
    <>
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>Page d'inscription</h1>
        <p>Inscription d'un employe.</p>
      </div>

      {(erreurChargement || erreurSubmit) && (
        <p style={{ color: "crimson", textAlign: "center" }}>
          {erreurSubmit || erreurChargement}
        </p>
      )}

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
          type="text"
          placeholder="Nom"
          className="input-field"
          value={nomEmploye}
          onChange={(e) => setNomEmploye(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Prenom"
          className="input-field"
          value={prenomEmploye}
          onChange={(e) => setPrenomEmploye(e.target.value)}
          required
        />
        <small>Matricule genere automatiquement.</small>
        <input
          type="password"
          placeholder="Mot de passe"
          className="input-field"
          value={mdpEmploye}
          onChange={(e) => setMdpEmploye(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="input-field"
          value={emailEmploye}
          onChange={(e) => setEmailEmploye(e.target.value)}
          required
        />
        <input
          type="date"
          className="input-field"
          value={dateEmbauche}
          onChange={(e) => setDateEmbauche(e.target.value)}
        />

        <select
          className="input-field"
          value={magasinId}
          onChange={(e) => setMagasinId(e.target.value)}
          required
        >
          <option value="">-- Selectionnez un magasin --</option>
          {magasins.map((mag) => (
            <option key={mag.id} value={mag.id}>
              {mag.ville} - {mag.rue}
            </option>
          ))}
        </select>

        <select
          className="input-field"
          value={typeContratId}
          onChange={(e) => setTypeContratId(e.target.value)}
          required
        >
          <option value="">-- Selectionnez un contrat --</option>
          {typeContrats.map((contrat) => (
            <option key={contrat.id} value={contrat.id}>
              {contrat.nomTypeContrat} ({contrat.heureContrat}h)
            </option>
          ))}
        </select>

        <button type="submit" className="submit-button" disabled={envoiEnCours}>
          {envoiEnCours ? "Inscription..." : "Inscrire l'employe"}
        </button>
      </form>
    </>
  );
}
