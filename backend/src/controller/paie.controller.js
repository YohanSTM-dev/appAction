import db from "../db/connexionBdd.js";

const Employe = db.models.Employe;
const Planning = db.models.Planning;
const TypeContrat = db.models.TypeContrat;
const FicheDePaie = db.models.FicheDePaie;

/**
 * Calcule le nombre de jours ouvrés (lundi–vendredi) entre deux dates incluses.
 * @param {Date|string} dateDebut
 * @param {Date|string} dateFin
 * @returns {number}
 */
const calculerJoursOuvres = (dateDebut, dateFin) => {
    let jours = 0;
    const courant = new Date(dateDebut);
    const fin = new Date(dateFin);

    while (courant <= fin) {
        const jour = courant.getDay(); // 0 = dimanche, 6 = samedi
        if (jour !== 0 && jour !== 6) jours++;
        courant.setDate(courant.getDate() + 1);
    }
    return jours;
};

/**
 * Extrait la valeur numérique d'un champ heureContrat ("35h", "35 heures", "35" → 35).
 * @param {string|number} heureContrat
 * @returns {number}
 */
const extraireHeuresContrat = (heureContrat) => {
    const valeur = parseInt(String(heureContrat || "0").replace(/[^0-9]/g, ""), 10);
    return isNaN(valeur) ? 0 : valeur;
};

/**
 * Calcule les heures supplémentaires d'un employé pour un mois/année donnés.
 * Compare les heures effectuées (plannings × 8h/jour ouvré) aux heures du contrat (hebdo × 4,33).
 * POST /api/paie/heures-sup  — Body: { employe_id, mois, annee }
 */
export const calculerHeureSup = async (req, res) => {
    try {
        const { employe_id, mois, annee } = req.body;

        if (!employe_id || !mois || !annee) {
            return res.status(400).json({ error: "employe_id, mois et annee sont obligatoires." });
        }

        // Récupérer l'employé avec son type de contrat pour les heures de base
        const employe = await Employe.findByPk(employe_id, {
            include: [{
                model: TypeContrat,
                as: "type_contrat",
                attributes: ["heureContrat", "nomTypeContrat"],
            }],
        });

        if (!employe) {
            return res.status(404).json({ error: "Employé introuvable." });
        }

        // Définir la plage du mois (1er jour → dernier jour)
        const debutMois = new Date(annee, mois - 1, 1);
        const finMois = new Date(annee, mois, 0);

        // Récupérer tous les plannings de l'employé qui débutent dans ce mois
        const plannings = await Planning.findAll({
            where: {
                employe_id,
                dateDebut: { [db.Sequelize.Op.between]: [debutMois, finMois] },
            },
        });

        // Calculer les heures effectuées : jours ouvrés × 8h
        let heuresEffectuees = 0;
        plannings.forEach((p) => {
            const jours = calculerJoursOuvres(p.dateDebut, p.dateFin || p.dateDebut);
            heuresEffectuees += jours * 8;
        });

        // Heures théoriques du contrat pour ce mois (hebdo × 4.33 semaines en moyenne)
        const heuresHebdo = extraireHeuresContrat(employe.type_contrat?.heureContrat);
        const heuresContratMois = Math.round(heuresHebdo * 4.33);

        // Les heures supplémentaires = tout ce qui dépasse le contrat (minimum 0)
        const heuresSupplementaires = Math.max(0, heuresEffectuees - heuresContratMois);

        res.status(200).json({
            employe_id,
            mois,
            annee,
            nomContrat: employe.type_contrat?.nomTypeContrat || "—",
            heuresContratMois,
            heuresEffectuees,
            heuresSupplementaires,
        });
    } catch (error) {
        console.error("Erreur lors du calcul des heures supplémentaires :", error);
        res.status(500).json({ error: "Une erreur est survenue lors du calcul." });
    }
};

/**
 * Retourne toutes les fiches de paie d'un employé, triées du plus récent au plus ancien.
 * GET /api/paie/fiches/:employe_id
 */
export const getFichesDePaieByEmploye = async (req, res) => {
    try {
        const { employe_id } = req.params;

        const fiches = await FicheDePaie.findAll({
            where: { employe_id },
            order: [["annee", "DESC"], ["mois", "DESC"]],
        });

        res.status(200).json(fiches);
    } catch (error) {
        console.error("Erreur lors de la récupération des fiches de paie :", error);
        res.status(500).json({ error: "Une erreur est survenue." });
    }
};

/**
 * Crée et enregistre une fiche de paie en base.
 * POST /api/paie/fiches  — Body: { employe_id, mois, annee, montantNet?, heuresTravaillees?, heuresSupplementaires? }
 */
export const createFicheDePaie = async (req, res) => {
    try {
        const { employe_id, mois, annee, montantNet, heuresTravaillees, heuresSupplementaires } = req.body;

        if (!employe_id || !mois || !annee) {
            return res.status(400).json({ error: "employe_id, mois et annee sont obligatoires." });
        }

        const fiche = await FicheDePaie.create({
            employe_id,
            mois,
            annee,
            montantNet: montantNet ?? null,
            heuresTravaillees: heuresTravaillees ?? null,
            heuresSupplementaires: heuresSupplementaires ?? null,
        });

        res.status(201).json(fiche);
    } catch (error) {
        console.error("Erreur lors de la création de la fiche de paie :", error);
        res.status(500).json({ error: "Une erreur est survenue lors de la création." });
    }
};
