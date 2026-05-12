import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

const nettoyerTexte = (value) => value.trim();

const construireErreurReponse = async (response) => {
  let details = "";
  try {
    const json = await response.clone().json();
    details = json?.error || JSON.stringify(json);
  } catch {
    details = await response.text();
  }

  return details || `HTTP ${response.status}`;
};

export default function RegisterAdmin() {
  const [magasins, setMagasins] = useState([]);
  const [typeContrats, setTypeContrats] = useState([]);
  const [erreurChargement, setErreurChargement] = useState(null);

  // Champs Magasin (table Magasin)
  const [ville, setVille] = useState("");
  const [rue, setRue] = useState("");
  const [adresse, setAdresse] = useState("");
  const [envoiMagasin, setEnvoiMagasin] = useState(false);

  // Champs Employe (table Employe)
  const [nomEmploye, setNomEmploye] = useState("");
  const [prenomEmploye, setPrenomEmploye] = useState("");
  const [mdpEmploye, setMdpEmploye] = useState("");
  const [emailEmploye, setEmailEmploye] = useState("");
  const [dateEmbauche, setDateEmbauche] = useState("");
  const [magasinId, setMagasinId] = useState("");
  const [typeContratId, setTypeContratId] = useState("");
  const [envoiEmploye, setEnvoiEmploye] = useState(false);

  // Champs TypeContrat (table TypeContrat)
  const [heureContrat, setHeureContrat] = useState("");
  const [nomTypeContrat, setNomTypeContrat] = useState("");
  const [envoiContrat, setEnvoiContrat] = useState(false);

  const chargerReferentiels = async () => {
    setErreurChargement(null);
    try {
      const [repMagasins, repContrats] = await Promise.all([
        fetch(`${API_BASE_URL}/magasins`),
        fetch(`${API_BASE_URL}/typeContrats`),
      ]);

      const magasinsJson = repMagasins.ok ? await repMagasins.json() : [];
      const contratsJson = repContrats.ok ? await repContrats.json() : [];

      setMagasins(Array.isArray(magasinsJson) ? magasinsJson : []);
      setTypeContrats(Array.isArray(contratsJson) ? contratsJson : []);
    } catch (error) {
      console.error("Erreur reseau lors du chargement initial :", error);
      setErreurChargement(error?.message || "Erreur reseau.");
      setMagasins([]);
      setTypeContrats([]);
    }
  };

  useEffect(() => {
    chargerReferentiels();
  }, []);

  const handleSubmitContrat = async (e) => {
    e.preventDefault();
    setEnvoiContrat(true);

    const nouveauContrat = {
      heureContrat: nettoyerTexte(heureContrat),
      nomTypeContrat: nettoyerTexte(nomTypeContrat),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/typeContrats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nouveauContrat),
      });

      if (!response.ok) {
        throw new Error(await construireErreurReponse(response));
      }

      alert("Type de contrat cree avec succes.");
      setHeureContrat("");
      setNomTypeContrat("");
      await chargerReferentiels();
    } catch (error) {
      console.error("Erreur lors de la creation du contrat:", error);
      alert("Erreur lors de la creation du contrat.");
    } finally {
      setEnvoiContrat(false);
    }
  };

  const handleSubmitMagasin = async (e) => {
    e.preventDefault();
    setEnvoiMagasin(true);

    const nouveauMagasin = {
      ville: nettoyerTexte(ville),
      rue: nettoyerTexte(rue),
      adresse: nettoyerTexte(adresse),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/magasins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nouveauMagasin),
      });

      if (!response.ok) {
        throw new Error(await construireErreurReponse(response));
      }

      alert("Magasin cree avec succes.");
      setVille("");
      setRue("");
      setAdresse("");
      await chargerReferentiels();
    } catch (error) {
      console.error("Erreur lors de la creation du magasin:", error);
      alert("Erreur lors de la creation du magasin.");
    } finally {
      setEnvoiMagasin(false);
    }
  };

  const handleSubmitEmploye = async (e) => {
    e.preventDefault();
    setEnvoiEmploye(true);

    const magasinIdNumber = Number(magasinId);
    const typeContratIdNumber = Number(typeContratId);

    const nouveauEmploye = {
      nomEmploye: nettoyerTexte(nomEmploye),
      prenomEmploye: nettoyerTexte(prenomEmploye),
      mdpEmploye: nettoyerTexte(mdpEmploye),
      emailEmploye: nettoyerTexte(emailEmploye),
      date_embauche: dateEmbauche || null,
      magasin_id: Number.isNaN(magasinIdNumber) ? null : magasinIdNumber,
      type_contrat_id: Number.isNaN(typeContratIdNumber)
        ? null
        : typeContratIdNumber,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/employes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nouveauEmploye),
      });

      if (!response.ok) {
        throw new Error(await construireErreurReponse(response));
      }

      alert("Employe cree avec succes.");
      setNomEmploye("");
      setPrenomEmploye("");
      setMdpEmploye("");
      setEmailEmploye("");
      setDateEmbauche("");
      setMagasinId("");
      setTypeContratId("");
    } catch (error) {
      console.error("Erreur lors de la creation de l'employe:", error);
      alert("Erreur lors de la creation de l'employe.");
    } finally {
      setEnvoiEmploye(false);
    }
  };

  return (
    <>
      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <h1>Niveau Administrateur</h1>
        <p>Creation de types de contrats, magasins et employes.</p>
        {erreurChargement && (
          <p style={{ color: "crimson" }}>Erreur: {erreurChargement}</p>
        )}
      </div>

      <div style={{ display: "grid", gap: "30px", maxWidth: "900px", margin: "0 auto" }}>
        <section>
          <h2>Nouveau type de contrat</h2>
          <form
            onSubmit={handleSubmitContrat}
            className="form-containerInscription"
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: "360px",
              gap: "10px",
            }}
          >
            <input
              type="text"
              placeholder="Heures (ex: 35)"
              className="input-field"
              value={heureContrat}
              onChange={(e) => setHeureContrat(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Nom du type de contrat"
              className="input-field"
              value={nomTypeContrat}
              onChange={(e) => setNomTypeContrat(e.target.value)}
              required
            />
            <button type="submit" disabled={envoiContrat}>
              {envoiContrat ? "Creation..." : "Creer le type de contrat"}
            </button>
          </form>
        </section>

        <section>
          <h2>Nouveau magasin</h2>
          <form
            onSubmit={handleSubmitMagasin}
            className="form-containerInscription"
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: "360px",
              gap: "10px",
            }}

          >
            <input
              type="text"
              placeholder="Ville"
              className="input-field"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Rue"
              className="input-field"
              value={rue}
              onChange={(e) => setRue(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Adresse"
              className="input-field"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
            />

            <button type="submit" disabled={envoiMagasin}>
              {envoiMagasin ? "Creation..." : "Creer le magasin"}
            </button>
            
          </form>
        </section>

        <section>
          <h2>Nouvel employe</h2>
          <form
            onSubmit={handleSubmitEmploye}
            className="form-containerInscription"
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: "360px",
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

            <button type="submit" disabled={envoiEmploye}>
              {envoiEmploye ? "Creation..." : "Creer l'employe"}
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
