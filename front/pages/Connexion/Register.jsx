import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000/api";

export default function Register() {
  const [nomEmploye, setNomEmploye] = useState("");
  const [prenomEmploye, setPrenomEmploye] = useState("");
  const [mdpEmploye, setMdpEmploye] = useState("");
  const [emailEmploye, setEmailEmploye] = useState("");
  const [dateEmbauche, setDateEmbauche] = useState("");

  const [magasinId, setMagasinId] = useState("");
  const [typeContratId, setTypeContratId] = useState("");

  const [magasins, setMagasins] = useState([]);
  const [typeContrats, setTypeContrats] = useState([]);

  const [erreurChargement, setErreurChargement] = useState(null);
  const [erreurSubmit, setErreurSubmit] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const chargerDonnees = async () => {
      setErreurChargement(null);
      try {
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
        console.error("Erreur reseau lors du chargement initial :", error);
        setErreurChargement(error?.message || "Erreur reseau.");
        setMagasins([]);
        setTypeContrats([]);
      }
    };

    chargerDonnees();
    return () => {
      cancelled = true;
    };
  }, []);

  const resetForm = () => {
    setNomEmploye("");
    setPrenomEmploye("");
    setMdpEmploye("");
    setEmailEmploye("");
    setDateEmbauche("");
    setMagasinId("");
    setTypeContratId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // empeche le rechargement brutal de la page

    setErreurSubmit(null);
    setEnvoiEnCours(true);

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
      resetForm();
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
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
