import db from "../db/connexionBdd.js";
import { Op } from "sequelize";

const Planning       = db.models["Planning"];
const Employe        = db.models["Employe"];
const TacheMag       = db.models["TacheMag"];
const CouleurTache   = db.models["CouleurTache"];
const TypeContrat    = db.models["TypeContrat"];
const tache_planning = db.models["tache_planning"];

// Nombre max de jours travaillés par semaine (5 = 2 jours de repos minimum)
const MAX_JOURS_TRAVAILLES = 5;

/**
 * Calcule le lundi (début de semaine) d'une date donnée.
 * @param {string} dateStr  format "YYYY-MM-DD"
 * @returns {{ lundi: Date, dimanche: Date }}
 */
const getSemaineDeDate = (dateStr) => {
  // Parsing en heure locale ("T00:00:00" sans suffixe Z = heure locale en JS)
  const d = new Date(dateStr + "T00:00:00");
  const jourSemaine = d.getDay(); // 0 = dim, 1 = lun ...
  const diffLundi = jourSemaine === 0 ? -6 : 1 - jourSemaine;
  const lundi = new Date(d);
  lundi.setDate(d.getDate() + diffLundi);
  lundi.setHours(0, 0, 0, 0);
  const dimanche = new Date(lundi);
  dimanche.setDate(lundi.getDate() + 6);
  dimanche.setHours(23, 59, 59, 999);
  return { lundi, dimanche };
};

/**
 * Retourne tous les plannings sans filtre (vue admin).
 * GET /api/plannings
 */
export const getAllPlanning = async (req, res) => {
  try {
    const allPlanning = await Planning.findAll();
    res.status(200).json(allPlanning);
  } catch (error) {
    console.error("Erreur lors de la recuperation des Planning :", error);
    res.status(500).json({ error: "Erreur lors de la recuperation des Planning." });
  }
};

/**
 * Retourne tous les plannings d'un magasin pour une semaine donnée,
 * avec les employés et leurs tâches colorées.
 * GET /api/plannings/magasin/:magasinId/semaine?debut=YYYY-MM-DD
 */
export const getPlanningsSemaine = async (req, res) => {
  try {
    const { magasinId } = req.params;
    const { debut } = req.query;

    if (!debut) return res.status(400).json({ error: "Le paramètre 'debut' est requis (YYYY-MM-DD)." });

    const { lundi, dimanche } = getSemaineDeDate(debut);

    const plannings = await Planning.findAll({
      where: {
        dateDebut: { [Op.between]: [lundi, dimanche] },
      },
      include: [
        {
          model: Employe,
          as: "employe",
          where: { magasin_id: Number(magasinId) },
          attributes: ["id", "nomEmploye", "prenomEmploye", "type_contrat_id"],
          include: [
            // On embarque le contrat pour connaître le créneau autorisé
            { model: TypeContrat, as: "type_contrat", attributes: ["id", "nomTypeContrat", "heureContrat", "creneau"] },
          ],
        },
        {
          model: TacheMag,
          as: "tache_id_TacheMags",
          through: { attributes: [] },
          include: [{ model: CouleurTache, as: "couleur_tache", attributes: ["couleur", "nomCouleurRep"] }],
        },
      ],
    });

    res.status(200).json(plannings);
  } catch (error) {
    console.error("Erreur getPlanningsSemaine :", error);
    res.status(500).json({ error: "Erreur lors de la récupération des plannings de la semaine." });
  }
};

/**
 * Retourne le planning d'un employé pour sa propre semaine (vue lecture seule).
 * GET /api/plannings/employe/:employeId/semaine?debut=YYYY-MM-DD
 */
export const getPlanningEmploye = async (req, res) => {
  try {
    const { employeId } = req.params;
    const { debut } = req.query;

    if (!debut) return res.status(400).json({ error: "Le paramètre 'debut' est requis (YYYY-MM-DD)." });

    const { lundi, dimanche } = getSemaineDeDate(debut);

    const plannings = await Planning.findAll({
      where: {
        employe_id: Number(employeId),
        dateDebut: { [Op.between]: [lundi, dimanche] },
      },
      include: [
        {
          model: TacheMag,
          as: "tache_id_TacheMags",
          through: { attributes: [] },
          include: [{ model: CouleurTache, as: "couleur_tache", attributes: ["couleur", "nomCouleurRep"] }],
        },
      ],
      order: [["dateDebut", "ASC"]],
    });

    res.status(200).json(plannings);
  } catch (error) {
    console.error("Erreur getPlanningEmploye :", error);
    res.status(500).json({ error: "Erreur lors de la récupération du planning." });
  }
};

/**
 * Assigne une tâche à un employé pour un jour précis.
 * - Crée le planning du jour si inexistant.
 * - Valide que le créneau est cohérent avec le contrat (si le contrat impose matin ou soir).
 * - Valide que l'employé ne dépasse pas 5 jours travaillés sur la semaine (2 jours de repos minimum).
 * POST /api/plannings/assigner-tache
 * Body: { employe_id, date, tache_id, creneau }
 *   creneau : 'matin' | 'soir' (requis si aucun planning existant pour ce jour)
 */
export const assignerTache = async (req, res) => {
  try {
    const { employe_id, date, tache_id, creneau } = req.body;

    if (!employe_id || !date) {
      return res.status(400).json({ error: "employe_id et date sont requis." });
    }
    // tache_id est optionnel : si null, on crée/met à jour juste le créneau

    // ── Vérification du contrat (créneau autorisé) ─────────────────────────
    const employe = await Employe.findByPk(Number(employe_id), {
      include: [{ model: TypeContrat, as: "type_contrat", attributes: ["creneau", "nomTypeContrat"] }],
    });

    if (!employe) return res.status(404).json({ error: "Employé introuvable." });

    const creneauContrat = employe.type_contrat?.creneau ?? null; // 'matin' | 'soir' | null

    // Si le contrat impose un créneau ET que le créneau demandé est différent → refus
    if (creneauContrat && creneau && creneau !== creneauContrat) {
      return res.status(409).json({
        error: `Ce contrat (${employe.type_contrat?.nomTypeContrat}) impose le créneau "${creneauContrat}". Impossible d'assigner "${creneau}".`,
      });
    }

    // Le créneau effectif = celui demandé, sinon celui du contrat, sinon null
    const creneauEffectif = creneau || creneauContrat || null;

    // ── Vérification du planning existant pour ce jour ─────────────────────
    const planningExistant = await Planning.findOne({
      where: { employe_id: Number(employe_id), dateDebut: date, dateFin: date },
    });

    // Si un planning existe déjà pour ce jour avec un créneau différent → refus
    if (planningExistant && planningExistant.creneau && creneauEffectif && planningExistant.creneau !== creneauEffectif) {
      return res.status(409).json({
        error: `Ce jour est déjà planifié en "${planningExistant.creneau}". Impossible de mélanger les créneaux sur un même jour.`,
      });
    }

    // ── Vérification des 2 jours de repos par semaine ─────────────────────
    if (!planningExistant) {
      // L'employé n'a pas encore de planning ce jour → on va en créer un
      // On compte les jours distincts déjà planifiés cette semaine
      const { lundi, dimanche } = getSemaineDeDate(date);
      const joursDejaPlannifies = await Planning.count({
        where: {
          employe_id: Number(employe_id),
          dateDebut: { [Op.between]: [lundi, dimanche] },
        },
      });

      if (joursDejaPlannifies >= MAX_JOURS_TRAVAILLES) {
        return res.status(422).json({
          error: `L'employé a déjà ${MAX_JOURS_TRAVAILLES} jours travaillés cette semaine. Il doit avoir au moins 2 jours de repos.`,
        });
      }
    }

    // ── Création ou récupération du planning + ajout de la tâche ──────────
    const [planning] = await Planning.findOrCreate({
      where: { employe_id: Number(employe_id), dateDebut: date, dateFin: date },
      defaults: {
        employe_id: Number(employe_id),
        dateDebut: date,
        dateFin: date,
        statut: "en_cours",
        creneau: creneauEffectif,
      },
    });

    // Si le créneau vient d'être précisé et qu'il manquait, on le sauvegarde
    if (!planning.creneau && creneauEffectif) {
      await planning.update({ creneau: creneauEffectif });
    }

    if (tache_id) {
      await tache_planning.findOrCreate({
        where: { planning_id: planning.id, tache_id: Number(tache_id) },
      });
    }

    res.status(200).json({ message: tache_id ? "Tâche assignée." : "Créneau enregistré.", planning_id: planning.id, creneau: planning.creneau || creneauEffectif });
  } catch (error) {
    console.error("Erreur assignerTache :", error);
    res.status(500).json({ error: "Erreur lors de l'assignation de la tâche." });
  }
};

/**
 * Retire une tâche d'un planning (suppression dans tache_planning).
 * DELETE /api/plannings/retirer-tache
 * Body: { employe_id, date, tache_id }
 */
export const retirerTache = async (req, res) => {
  try {
    const { employe_id, date, tache_id } = req.body;

    const planning = await Planning.findOne({
      where: { employe_id: Number(employe_id), dateDebut: date, dateFin: date },
    });

    if (!planning) return res.status(404).json({ error: "Planning non trouvé pour ce jour." });

    await tache_planning.destroy({
      where: { planning_id: planning.id, tache_id: Number(tache_id) },
    });

    res.status(200).json({ message: "Tâche retirée." });
  } catch (error) {
    console.error("Erreur retirerTache :", error);
    res.status(500).json({ error: "Erreur lors du retrait de la tâche." });
  }
};

/**
 * Crée un planning manuellement depuis le body de la requête.
 * POST /api/plannings
 */
export const createPlanning = async (req, res) => {
  try {
    const newPlanning = await Planning.create(req.body);
    res.status(201).json(newPlanning);
  } catch (error) {
    console.error("Erreur lors de la creation de Planning :", error);
    res.status(500).json({ error: "Erreur lors de la creation de Planning." });
  }
};

/**
 * Met à jour le statut d'un planning (ex: en_cours → terminé).
 * PATCH /api/plannings/:id/statut
 */
export const updateStatutPlanning = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    const planning = await Planning.findByPk(id);
    if (!planning) return res.status(404).json({ error: "Planning non trouve." });
    await planning.update({ statut });
    res.status(200).json(planning);
  } catch (error) {
    console.error("Erreur updateStatutPlanning :", error);
    res.status(500).json({ error: "Erreur lors de la mise a jour du statut." });
  }
};

