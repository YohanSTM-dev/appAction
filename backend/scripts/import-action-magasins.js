// pour importer npm run import:action 

import db from "../src/db/connexionBdd.js";
// import depuis OpenStreetMap

const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

function normalizeText(value) {
  if (!value) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function toTitleCase(value) {
  const text = normalizeText(value).toLowerCase();
  if (!text) return "";
  return text.replace(/\b\p{L}/gu, (char) => char.toUpperCase());
}

function buildAddress(tags, element) {
  const houseNumber = normalizeText(tags["addr:housenumber"]);
  const street = normalizeText(tags["addr:street"]);
  const postcode = normalizeText(tags["addr:postcode"]);
  const city = normalizeText(tags["addr:city"]);

  const parts = [];
  const line1 = normalizeText(`${houseNumber} ${street}`);
  if (line1) parts.push(line1);

  const line2 = normalizeText(`${postcode} ${city}`);
  if (line2) parts.push(line2);

  if (parts.length > 0) return parts.join(", ");

  const lat = element?.lat ?? element?.center?.lat;
  const lon = element?.lon ?? element?.center?.lon;
  if (lat && lon) {
    return `Coords: ${lat}, ${lon}`;
  }

  return "Adresse inconnue";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildAddressFromNominatim(address) {
  const houseNumber = normalizeText(address?.house_number);
  const road = normalizeText(address?.road);
  const postcode = normalizeText(address?.postcode);
  const city = normalizeText(
    address?.city || address?.town || address?.village || address?.municipality,
  );

  const parts = [];
  const line1 = normalizeText(`${houseNumber} ${road}`);
  if (line1) parts.push(line1);

  const line2 = normalizeText(`${postcode} ${city}`);
  if (line2) parts.push(line2);

  return parts.join(", ") || "Adresse inconnue";
}

async function fetchActionStoresFromNominatim() {
  const limit = 50;
  const maxPages = 8;
  const rows = [];
  const dedupe = new Set();

  for (let page = 0; page < maxPages; page += 1) {
    const offset = page * limit;
    const url = `${NOMINATIM_URL}?format=jsonv2&q=${encodeURIComponent("Action")}&countrycodes=fr&addressdetails=1&dedupe=1&limit=${limit}&offset=${offset}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "appAction-store-import/1.0",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Nominatim HTTP ${response.status}: ${body}`);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) break;

    for (const item of data) {
      const name = normalizeText(item?.name || item?.display_name || "");
      if (!/action/i.test(name)) continue;

      const ville = toTitleCase(
        item?.address?.city ||
          item?.address?.town ||
          item?.address?.village ||
          item?.address?.municipality ||
          "",
      );
      const rue = toTitleCase(item?.address?.road || "");
      const adresse = buildAddressFromNominatim(item?.address);

      if (!ville && !rue) continue;

      const key = `${ville.toLowerCase()}|${rue.toLowerCase()}|${adresse.toLowerCase()}`;
      if (dedupe.has(key)) continue;
      dedupe.add(key);

      rows.push({ ville, rue, adresse });
    }

    await sleep(1100);
  }

  return rows;
}

async function callOverpass(overpassUrl, query) {
  const response = await fetch(overpassUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Overpass HTTP ${response.status}: ${body}`);
  }

  const data = await response.json();
  if (!Array.isArray(data?.elements)) {
    throw new Error("Format de reponse Overpass invalide.");
  }

  return data.elements;
}

async function fetchActionStoresFromOverpass() {
  const query = `
[out:json][timeout:90];
area["name"="France"]["admin_level"="2"]->.fr;
(
  node["name"~"Action", i](area.fr);
  node["brand"~"Action", i](area.fr);
  way["name"~"Action", i](area.fr);
  way["brand"~"Action", i](area.fr);
);
out center tags;
`;

  let lastError;
  for (const url of OVERPASS_URLS) {
    try {
      console.log(`Tentative Overpass: ${url}`);
      const elements = await callOverpass(url, query);
      console.log(`Reponse Overpass OK depuis: ${url}`);
      return elements;
    } catch (error) {
      lastError = error;
      console.warn(`Echec Overpass sur ${url}:`, error.message || error);
    }
  }

  throw lastError || new Error("Impossible d'interroger Overpass.");
}

async function main() {
  const Magasin = db.models.Magasin;

  try {
    await db.sequelize.authenticate();
    console.log("Connexion BDD OK.");

    let normalizedRows = [];

    try {
      const elements = await fetchActionStoresFromOverpass();
      console.log(`Elements recuperes depuis Overpass: ${elements.length}`);

      const dedupe = new Set();
      for (const element of elements) {
        const tags = element?.tags || {};
        const name = normalizeText(tags.name || tags.brand);
        if (!/action/i.test(name)) continue;

        const ville = toTitleCase(
          tags["addr:city"] || tags["addr:town"] || tags["addr:village"] || "",
        );
        const rue = toTitleCase(tags["addr:street"] || "");
        const adresse = buildAddress(tags, element);

        if (!ville && !rue) continue;

        const key = `${ville.toLowerCase()}|${rue.toLowerCase()}|${adresse.toLowerCase()}`;
        if (dedupe.has(key)) continue;
        dedupe.add(key);

        normalizedRows.push({ ville, rue, adresse });
      }
    } catch (error) {
      console.warn("Overpass indisponible, fallback Nominatim.", error.message || error);
    }

    if (normalizedRows.length === 0) {
      console.log("Chargement via Nominatim...");
      normalizedRows = await fetchActionStoresFromNominatim();
    }

    console.log(`Lignes apres nettoyage: ${normalizedRows.length}`);

    let inserted = 0;
    let skipped = 0;

    for (const row of normalizedRows) {
      const exists = await Magasin.findOne({
        where: {
          ville: row.ville,
          rue: row.rue,
          adresse: row.adresse,
        },
      });

      if (exists) {
        skipped += 1;
        continue;
      }

      await Magasin.create(row);
      inserted += 1;
    }

    console.log(`Import termine. Inseres: ${inserted}, deja presents: ${skipped}`);
  } catch (error) {
    console.error("Erreur import magasins Action:", error.message || error);
    process.exitCode = 1;
  } finally {
    await db.sequelize.close();
  }
}

main();
