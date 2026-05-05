/**
 * Utilitaire centralisé pour la gestion des rôles (RBAC).
 * Toute la logique de rôle est ici — on n'éparpille plus les vérifications dans chaque composant.
 *
 * Rôles reconnus (insensible à la casse, correspondance partielle) :
 *   - "admin"       → Administrateur (accès total)
 *   - "rh"          → Responsable RH (gestion paie, contrats, employés)
 *   - "manager" | "responsable" → Manager de magasin (planning, congés)
 *   - tout le monde → Employé de base
 */

// Récupère le tableau de rôles de l'employé connecté depuis le localStorage
const getRoles = () => {
    try {
        const employe = JSON.parse(localStorage.getItem("employeConnecte") || "null");
        return (employe?.roles || []).map((r) => String(r).toLowerCase());
    } catch {
        return [];
    }
};

export const estConnecte = () => {
    try {
        return Boolean(JSON.parse(localStorage.getItem("employeConnecte") || "null"));
    } catch {
        return false;
    }
};

export const estAdmin = () => getRoles().some((r) => r.includes("admin"));

export const estRH = () => getRoles().some((r) => r.includes("rh") || r.includes("admin"));

export const estManager = () =>
    getRoles().some((r) =>
        r.includes("manager") || r.includes("responsable") || r.includes("admin")
    );

/**
 * Retourne la route de redirection après connexion selon le rôle le plus élevé.
 * Hiérarchie : Admin > RH > Manager > Employé
 */
export const getRedirectionApresLogin = (roles = []) => {
    const r = roles.map((s) => String(s).toLowerCase());

    if (r.some((s) => s.includes("admin")))       return "/direction";
    if (r.some((s) => s.includes("rh")))           return "/rh";
    if (r.some((s) => s.includes("manager") || s.includes("responsable"))) return "/planning/gestion";
    return "/acceuil"; // Employé de base
};
