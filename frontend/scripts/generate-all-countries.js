/**
 * Unified JSON generator for ALL countries
 * Parses .md files and generates country-specific JSON files
 * Run: node scripts/generate-all-countries.js
 */
const fs = require('fs');
const path = require('path');
const { ITALY_REGIONS, SPAIN_REGIONS } = require('./city-to-region');

const MD_DIR = path.join(__dirname, '../../');
const OUT_DIR = path.join(__dirname, '../public/data/');
const EUR_TO_BDT = 128;

// ══════════════════════════════════════════════════════════════
// QS World University Rankings 2026 — ALL COUNTRIES
// Source: topuniversities.com, study.eu, campusfrance.org
// Verified April 2026
// ══════════════════════════════════════════════════════════════
const QS_RANKINGS = {
  // Sweden (7 ranked)
  'Lund University': 72, 'KTH Royal Institute of Technology': 78,
  'Uppsala University': 93, 'Stockholm University': 147,
  'Karolinska Institutet': 164, 'Chalmers University of Technology': 165,
  'University of Gothenburg': 202, 'Linköping University': 280,
  'Umeå University': 330, 'Luleå University of Technology': 450,
  'Stockholm School of Economics': 280, 'Jönköping University': 530,
  'Karlstad University': 630, 'Örebro University': 630,
  'Linnaeus University': 730, 'Malmö University': 900, 'Mid Sweden University': 900,

  // France (35 ranked)
  'PSL University': 28, 'Institut Polytechnique de Paris': 41,
  'Paris-Saclay University': 70, 'Sorbonne University': 72,
  'École Normale Supérieure de Lyon': 205, 'Paris 1 Panthéon-Sorbonne University': 257,
  'Paris Cité University': 300, 'University of Grenoble Alpes': 321,
  'Sciences Po Paris': 367, 'INSA Lyon': 406,
  'University of Strasbourg': 420, 'Aix-Marseille University': 428,
  'University of Montpellier': 430, 'University of Bordeaux': 494,
  'Claude Bernard University Lyon 1': 520, 'University of Toulouse': 530,
  'University of Lille': 600, 'Université Côte d\'Azur': 620,
  'University of Rennes': 640, 'University of Lorraine': 650,
  'University of Nantes': 670, 'University of Burgundy Europe': 720,
  'Marie and Louis Pasteur University': 720, 'CY Cergy Paris University': 850,
  'University of Poitiers': 1300, 'University of Limoges': 1100,
  'University of Caen Normandy': 1100, 'Toulouse Capitole University': 1100,
  'University of Western Brittany': 1300,
  // French private
  'HEC Paris': 4, 'ESSEC Business School': 10, 'ESCP Business School': 10,
  'INSEAD': 1,

  // Hungary (10 ranked)
  'University of Debrecen': 563, 'Eötvös Loránd University': 584,
  'University of Szeged': 597, 'Budapest University of Technology and Economics': 715,
  'University of Pécs': 745, 'Óbuda University': 1001,
  'Széchenyi István University': 1001, 'University of Miskolc': 1201,
  'University of Pannonia': 1201,
  // Hungary THE
  'Semmelweis University': 251, 'Central European University': 251,

  // Denmark (5 ranked)
  'University of Copenhagen': 101, 'Technical University of Denmark': 107,
  'Aarhus University': 131, 'University of Southern Denmark': 303,
  'Aalborg University': 306,

  // Malta (1 ranked)
  'University of Malta': 745,
};

// ══════════════════════════════════════════════════════════════
// VERIFIED PER-UNIVERSITY FEES (Non-EU, per year, EUR)
// Sources: Official university websites, verified April 2026
// Format: { bsc: EUR/yr, msc: EUR/yr, note: 'source' }
// ══════════════════════════════════════════════════════════════
const VERIFIED_FEES = {
  // SWEDEN (from official university websites, SEK converted at 1 SEK ≈ €0.088)
  'Lund University': { bsc: 11000, msc: 17000, note: 'SEK 90K-160K BSc, SEK 100K-290K MSc (lunduniversity.lu.se)' },
  'KTH Royal Institute of Technology': { bsc: 12400, msc: 15500, note: 'SEK 141K BSc, SEK 155-180K MSc (kth.se)' },
  'Uppsala University': { bsc: 12000, msc: 10000, note: 'SEK 99K-180K BSc, SEK 90K-135K MSc (uu.se)' },
  'Stockholm University': { bsc: 10000, msc: 11000, note: 'Humanities SEK 90K, Sciences SEK 140K/yr (su.se)' },
  'Karolinska Institutet': { bsc: 16000, msc: 16000, note: 'SEK 165K-200K/yr (ki.se)' },
  'University of Gothenburg': { bsc: 10500, msc: 14000, note: 'SEK 86K-143K BSc, SEK 86K-295K MSc (gu.se)' },
  'Chalmers University of Technology': { bsc: 14100, msc: 14100, note: 'SEK 160K/yr; Architecture SEK 210K (chalmers.se)' },
  'Linköping University': { bsc: 10000, msc: 10000, note: 'SEK 80K-140K/yr (liu.se)' },
  'Stockholm School of Economics': { bsc: 10600, msc: 13200, note: 'SEK 120K BSc, SEK 150K MSc (hhs.se)' },
  'Jönköping University': { bsc: 13500, msc: 12000, note: 'SEK 115-190K/sem BSc, SEK 60-85K/sem MSc (ju.se)' },

  // DENMARK (from official university websites, DKK converted at 1 DKK ≈ €0.134)
  'University of Copenhagen': { bsc: 11000, msc: 13000, note: 'DKK 65K-100K BSc, DKK 75K-120K MSc (ku.dk)' },
  'Technical University of Denmark': { bsc: 0, msc: 15000, note: 'BSc Danish only; MSc €7,500/sem = €15,000/yr (dtu.dk)' },
  'Aarhus University': { bsc: 10400, msc: 11400, note: 'DKK 60K-95K BSc, DKK 65K-105K MSc (au.dk)' },
  'University of Southern Denmark': { bsc: 8800, msc: 8800, note: 'DKK 48.6K-82.8K/yr (sdu.dk)' },
  'Aalborg University': { bsc: 9000, msc: 9000, note: 'DKK 49K-85K/yr (aau.dk)' },
  'Copenhagen Business School': { bsc: 12000, msc: 13000, note: 'DKK 80K-110K/yr (cbs.dk)' },
  'Roskilde University': { bsc: 8700, msc: 8700, note: 'DKK 55K-75K/yr (ruc.dk)' },
  'IT University of Copenhagen': { bsc: 10700, msc: 10700, note: 'DKK 70K-90K/yr (itu.dk)' },

  // HUNGARY (from official university websites)
  'Eötvös Loránd University': { bsc: 3900, msc: 4600, note: '€2,800-5,000 BSc, €3,200-6,000 MSc (elte.hu)' },
  'Budapest University of Technology and Economics': { bsc: 5400, msc: 6800, note: '€2,250-4,500/sem = €4,500-9,000/yr (bme.hu)' },
  'Semmelweis University': { bsc: 15400, msc: 16100, note: 'Medicine: €12,000/sem; Other: varies (semmelweis.hu)' },
  'Corvinus University of Budapest': { bsc: 4500, msc: 5500, note: '€3,500-5,500 BSc, €4,000-7,000 MSc (uni-corvinus.hu)' },
  'University of Debrecen': { bsc: 4500, msc: 5000, note: '€3,500-5,500 BSc/MSc; Medicine €6K-17.5K (unideb.hu)' },
  'University of Szeged': { bsc: 4500, msc: 5000, note: '€3,000-5,500/yr (u-szeged.hu)' },
  'University of Pécs': { bsc: 4500, msc: 5000, note: '€3,000-5,500/yr (pte.hu)' },
  'Óbuda University': { bsc: 3250, msc: 4000, note: '€2,500-4,000 BSc, €3,000-5,000 MSc (uni-obuda.hu)' },
  'Central European University': { bsc: 0, msc: 15000, note: 'MSc/PhD only: €12,000-18,000/yr (ceu.edu)' },
  'Budapest Metropolitan University': { bsc: 4650, msc: 5350, note: '€3,800-5,500 BSc, €4,200-6,500 MSc (metropolitan.hu)' },

  // MALTA (from official university websites)
  'University of Malta': { bsc: 8250, msc: 11500, note: '€6,500-10,000 BSc, €8,000-15,000 MSc; Medicine €20K+ (um.edu.mt)' },

  // SPAIN (from study.eu, regional government per-ECTS data)
  // Catalonia: ~€110/ECTS non-EU = ~€6,600/yr for 60 ECTS master
  // Madrid: ~€45/ECTS non-EU = ~€2,700/yr for 60 ECTS master
  // Andalusia: same rate for EU and non-EU = ~€757-€1,200/yr
  'University of Barcelona': { bsc: 4400, msc: 6600, note: 'Catalonia: ~€73/ECTS BSc, ~€110/ECTS MSc non-EU (ub.edu)' },
  'Autonomous University of Barcelona': { bsc: 4400, msc: 6600, note: 'Catalonia rates (uab.cat)' },
  'Pompeu Fabra University': { bsc: 4400, msc: 6600, note: 'Catalonia rates (upf.edu)' },
  'Polytechnic University of Catalonia': { bsc: 4400, msc: 6600, note: 'Catalonia rates (upc.edu)' },
  'Complutense University of Madrid': { bsc: 2700, msc: 2700, note: 'Madrid: ~€45/ECTS non-EU (ucm.es)' },
  'Autonomous University of Madrid': { bsc: 2700, msc: 2700, note: 'Madrid: ~€45/ECTS non-EU (uam.es)' },
  'Carlos III University of Madrid': { bsc: 3200, msc: 4500, note: 'Madrid rates, higher for engineering (uc3m.es)' },
  'Technical University of Madrid': { bsc: 2700, msc: 2700, note: 'Madrid: ~€45/ECTS non-EU (upm.es)' },
  'University of Granada': { bsc: 757, msc: 821, note: 'Andalusia: same rate EU/non-EU — cheapest (ugr.es)' },
  'University of Seville': { bsc: 757, msc: 821, note: 'Andalusia: same rate EU/non-EU (us.es)' },
  'University of Málaga': { bsc: 757, msc: 821, note: 'Andalusia: same rate EU/non-EU (uma.es)' },
  'University of Valencia': { bsc: 1500, msc: 2500, note: 'Valencia region rates (uv.es)' },
  'Polytechnic University of Valencia': { bsc: 1500, msc: 2500, note: 'Valencia region rates (upv.es)' },
  'University of Santiago de Compostela': { bsc: 836, msc: 1200, note: 'Galicia: same rate EU/non-EU (usc.gal)' },
  'University of Salamanca': { bsc: 1500, msc: 2500, note: 'Castilla y León rates (usal.es)' },
  'IE University': { bsc: 18500, msc: 27500, note: 'Private — verified (ie.edu)' },
  'University of Navarra': { bsc: 12500, msc: 16000, note: 'Private Catholic — verified (unav.edu)' },
};

// Italy verified fees are in verified-fees.js (used by generate-italy-json.js)

// ─── Region mappings per country ───
const REGION_MAPS = {
  italy: ITALY_REGIONS,
  spain: SPAIN_REGIONS,
  sweden: {
    'Lund': 'Skåne', 'Stockholm': 'Stockholm', 'Uppsala': 'Uppsala',
    'Gothenburg': 'Västra Götaland', 'Linköping': 'Östergötland',
    'Umeå': 'Västerbotten', 'Luleå': 'Norrbotten', 'Karlstad': 'Värmland',
    'Örebro': 'Örebro', 'Sundsvall': 'Västernorrland', 'Malmö': 'Skåne',
    'Karlskrona': 'Blekinge', 'Borås': 'Västra Götaland', 'Falun': 'Dalarna',
    'Gävle': 'Gävleborg', 'Halmstad': 'Halland', 'Kristianstad': 'Skåne',
    'Skövde': 'Västra Götaland', 'Trollhättan': 'Västra Götaland',
    'Huddinge': 'Stockholm', 'Västerås': 'Västmanland', 'Eskilstuna': 'Södermanland',
    'Växjö': 'Kronoberg', 'Kalmar': 'Kalmar', 'Jönköping': 'Jönköping',
    'Östersund': 'Jämtland', 'Filipstad': 'Värmland', 'Kolding': 'Denmark',
    'Solna': 'Stockholm', 'Borlänge': 'Dalarna',
  },
  france: {
    'Paris': 'Île-de-France', 'Lyon': 'Auvergne-Rhône-Alpes', 'Marseille': 'PACA',
    'Toulouse': 'Occitanie', 'Bordeaux': 'Nouvelle-Aquitaine', 'Lille': 'Hauts-de-France',
    'Strasbourg': 'Grand Est', 'Nantes': 'Pays de la Loire', 'Rennes': 'Bretagne',
    'Grenoble': 'Auvergne-Rhône-Alpes', 'Montpellier': 'Occitanie', 'Nice': 'PACA',
    'Rouen': 'Normandie', 'Caen': 'Normandie', 'Reims': 'Grand Est',
    'Dijon': 'Bourgogne-Franche-Comté', 'Besançon': 'Bourgogne-Franche-Comté',
    'Brest': 'Bretagne', 'Poitiers': 'Nouvelle-Aquitaine', 'Clermont-Ferrand': 'Auvergne-Rhône-Alpes',
    'Saint-Denis': 'Île-de-France', 'Villetaneuse': 'Île-de-France', 'Nanterre': 'Île-de-France',
    'Créteil': 'Île-de-France', 'Cergy': 'Île-de-France', 'Évry': 'Île-de-France',
    'Versailles': 'Île-de-France', 'Saclay': 'Île-de-France', 'Marne-la-Vallée': 'Île-de-France',
    'Saint-Étienne': 'Auvergne-Rhône-Alpes', 'Chambéry': 'Auvergne-Rhône-Alpes',
    'Amiens': 'Hauts-de-France', 'Arras': 'Hauts-de-France', 'Dunkirk': 'Hauts-de-France',
    'Valenciennes': 'Hauts-de-France', 'Mulhouse': 'Grand Est', 'Nancy': 'Grand Est',
    'Le Havre': 'Normandie', 'Angers': 'Pays de la Loire', 'Le Mans': 'Pays de la Loire',
    'Orléans': 'Centre-Val de Loire', 'Tours': 'Centre-Val de Loire',
    'Pau': 'Nouvelle-Aquitaine', 'La Rochelle': 'Nouvelle-Aquitaine', 'Limoges': 'Nouvelle-Aquitaine',
    'Perpignan': 'Occitanie', 'Nîmes': 'Occitanie', 'Avignon': 'PACA', 'Toulon': 'PACA',
    'Corte': 'Corse', 'Vannes': 'Bretagne', 'Lorient': 'Bretagne',
    'Cayenne': 'French Guiana', 'Tahiti': 'French Polynesia',
    'Guadeloupe': 'French Antilles', 'Dembeni': 'Mayotte', 'Nouméa': 'New Caledonia',
    'Palaiseau': 'Île-de-France', 'Gif-sur-Yvette': 'Île-de-France',
    'Compiègne': 'Hauts-de-France', 'Troyes': 'Grand Est', 'Belfort': 'Bourgogne-Franche-Comté',
    'Jouy-en-Josas': 'Île-de-France', 'Fontainebleau': 'Île-de-France',
    'Sceaux': 'Île-de-France', 'Noisy-le-Grand': 'Île-de-France',
    'Ivry-sur-Seine': 'Île-de-France', 'La Défense': 'Île-de-France',
    'Paris La Défense': 'Île-de-France', 'Courbevoie': 'Île-de-France',
    'Roubaix': 'Hauts-de-France', 'Sophia-Antipolis': 'PACA',
    'Rueil-Malmaison': 'Île-de-France', 'Beauvais': 'Hauts-de-France',
    'Kolding': 'Denmark', 'Auzeville-Tolosane': 'Occitanie',
    'Pessac': 'Nouvelle-Aquitaine', 'Talence': 'Nouvelle-Aquitaine',
    'Écully': 'Auvergne-Rhône-Alpes', 'Villeurbanne': 'Auvergne-Rhône-Alpes',
    'Bruz': 'Bretagne', 'Blois': 'Centre-Val de Loire',
  },
  hungary: {
    'Budapest': 'Budapest', 'Debrecen': 'Hajdú-Bihar', 'Szeged': 'Csongrád-Csanád',
    'Pécs': 'Baranya', 'Miskolc': 'Borsod-Abaúj-Zemplén', 'Győr': 'Győr-Moson-Sopron',
    'Veszprém': 'Veszprém', 'Gödöllő': 'Pest', 'Sopron': 'Győr-Moson-Sopron',
    'Eger': 'Heves', 'Nyíregyháza': 'Szabolcs-Szatmár-Bereg', 'Kecskemét': 'Bács-Kiskun',
    'Dunaújváros': 'Fejér', 'Baja': 'Bács-Kiskun', 'Piliscsaba': 'Pest',
    'Tatabánya': 'Komárom-Esztergom', 'Vác': 'Pest', 'Tokaj': 'Borsod-Abaúj-Zemplén',
    'Pécel': 'Pest', 'Sárospatak': 'Borsod-Abaúj-Zemplén', 'Esztergom': 'Komárom-Esztergom',
    'Orosháza': 'Békés', 'Pembroke': 'Malta', 'Székesfehérvár': 'Fejér',
  },
  denmark: {
    'Copenhagen': 'Capital Region', 'Kongens Lyngby': 'Capital Region',
    'Frederiksberg': 'Capital Region', 'Aarhus': 'Central Denmark',
    'Odense': 'Southern Denmark', 'Aalborg': 'North Denmark',
    'Roskilde': 'Zealand', 'Kolding': 'Southern Denmark',
    'Sorø': 'Zealand', 'Vejle': 'Southern Denmark', 'Esbjerg': 'Southern Denmark',
    'Horsens': 'Central Denmark', 'Herning': 'Central Denmark',
    'Køge': 'Zealand', 'Randers': 'Central Denmark', 'Viborg': 'Central Denmark',
    'Haderslev': 'Southern Denmark', 'Fredericia': 'Southern Denmark',
    'Sundsvall': 'Sweden',
  },
  netherlands: {
    'Amsterdam': 'North Holland', 'Rotterdam': 'South Holland', 'The Hague': 'South Holland',
    'Utrecht': 'Utrecht', 'Leiden': 'South Holland', 'Groningen': 'Groningen',
    'Delft': 'South Holland', 'Eindhoven': 'North Brabant', 'Enschede': 'Overijssel',
    'Maastricht': 'Limburg', 'Nijmegen': 'Gelderland', 'Tilburg': 'North Brabant',
    'Wageningen': 'Gelderland', 'Kampen': 'Overijssel', 'Breukelen': 'Utrecht',
    'Leeuwarden': 'Friesland', 'Apeldoorn': 'Gelderland', 'Breda': 'North Brabant',
    'Den Bosch': 'North Brabant', 'Zwolle': 'Overijssel', 'Arnhem': 'Gelderland',
    'Haarlem': 'North Holland', 'Deventer': 'Overijssel',
  },
  austria: {
    'Vienna': 'Vienna', 'Wien': 'Vienna', 'Graz': 'Styria', 'Innsbruck': 'Tyrol',
    'Salzburg': 'Salzburg', 'Linz': 'Upper Austria', 'Klagenfurt': 'Carinthia',
    'Leoben': 'Styria', 'Krems': 'Lower Austria', 'St. Pölten': 'Lower Austria',
    'Wels': 'Upper Austria', 'Steyr': 'Upper Austria', 'Dornbirn': 'Vorarlberg',
    'Eisenstadt': 'Burgenland', 'Wiener Neustadt': 'Lower Austria', 'Hagenberg': 'Upper Austria',
    'Kufstein': 'Tyrol', 'Kapfenberg': 'Styria', 'Pinkafeld': 'Burgenland',
  },
  malta: {
    'Msida': 'Malta', 'Paola': 'Malta', 'Cospicua': 'Malta', 'Valletta': 'Malta',
    'Victoria': 'Gozo', 'Kalkara': 'Malta', 'SmartCity': 'Malta', 'Portomaso': 'Malta',
    'Ħamrun': 'Malta', 'Luqa': 'Malta', 'Birkirkara': 'Malta', 'Floriana': 'Malta',
    'St. Julian\'s': 'Malta', 'Pietà': 'Malta', 'Attard': 'Malta',
    'San Ġwann': 'Malta', 'Huddinge': 'Malta', 'Pembroke': 'Malta',
    'Qala': 'Gozo',
  },
};

// ─── Country configurations ───
const COUNTRIES = [
  {
    name: 'Sweden',
    slug: 'sweden',
    mdFiles: ['sweden-public-universities.md', 'sweden-private-universities.md'],
    output: 'sweden-universities.json',
    sections: [
      { marker: '## 1. PUBLIC UNIVERSITIES', end: '## 2. PUBLIC UNIVERSITY COLLEGES', type: 'Public' },
      { marker: '## 2. PUBLIC UNIVERSITY COLLEGES', end: '## 3. PUBLIC ART', type: 'Public' },
      { marker: '## 3. PUBLIC ART', end: '## ADMISSION REQUIREMENTS', type: 'Public' },
      { marker: '## 1. PRIVATE UNIVERSITIES', end: '## 2. PRIVATE UNIVERSITY COLLEGES', type: 'Private' },
      { marker: '## 2. PRIVATE UNIVERSITY COLLEGES', end: '## 3. INDEPENDENT', type: 'Private' },
      { marker: '## 3. INDEPENDENT', end: '## KEY NOTES', type: 'Private' },
    ],
    defaultBscReq: 'Upper secondary (12yr) + English 6 (IELTS 6.5)',
    defaultMscReq: 'Bachelor\'s degree (180 ECTS) + English 6 (IELTS 6.5)',
  },
  {
    name: 'France',
    slug: 'france',
    mdFiles: ['france-public-universities.md', 'france-private-universities.md'],
    output: 'france-universities.json',
    sections: [
      { marker: '## 1. PUBLIC UNIVERSITIES', end: '## 2. PUBLIC GRANDES', type: 'Public' },
      { marker: '## 2. PUBLIC GRANDES', end: '## ADMISSION REQUIREMENTS', type: 'Public' },
      { marker: '## 1. TOP PRIVATE BUSINESS', end: '## 2. PRIVATE ENGINEERING', type: 'Private' },
      { marker: '## 2. PRIVATE ENGINEERING', end: '## 3. ADDITIONAL PRIVATE BUSINESS', type: 'Private' },
      { marker: '## 3. ADDITIONAL PRIVATE BUSINESS', end: '## 4. PRIVATE SPECIALIZED', type: 'Private' },
      { marker: '## 4. PRIVATE SPECIALIZED', end: '## GRAND TOTAL', type: 'Private' },
    ],
    defaultBscReq: 'Bac/12yr + French B2 (DELF/TCF) or IELTS 6.0',
    defaultMscReq: 'Licence/BSc (180 ECTS) + French B2-C1 or IELTS 6.5',
  },
  {
    name: 'Hungary',
    slug: 'hungary',
    mdFiles: ['hungary-universities.md'],
    output: 'hungary-universities.json',
    sections: [
      { marker: '## 1. STATE/PUBLIC UNIVERSITIES', end: '## 2. PRIVATE', type: 'Public' },
      { marker: '## 2. PRIVATE', end: '## 3. CHURCH', type: 'Private' },
      { marker: '## 3. CHURCH', end: '## ADMISSION REQUIREMENTS', type: 'Church-Affiliated' },
    ],
    defaultBscReq: '12yr secondary + English B2 (IELTS 5.5)',
    defaultMscReq: 'BSc (180 ECTS) + English B2 (IELTS 6.0-6.5)',
  },
  {
    name: 'Malta',
    slug: 'malta',
    mdFiles: ['malta-universities.md'],
    output: 'malta-universities.json',
    sections: [
      { marker: '## 1. PUBLIC INSTITUTIONS', end: '## 2. PRIVATE UNIVERSITIES', type: 'Public' },
      { marker: '## 2. PRIVATE UNIVERSITIES', end: '## 3. LICENSED', type: 'Private' },
      { marker: '## 3. LICENSED', end: '## ADMISSION REQUIREMENTS', type: 'Private' },
    ],
    defaultBscReq: '12yr secondary + IELTS 6.0 (no section <5.5)',
    defaultMscReq: 'BSc/BA (180+ ECTS) + IELTS 6.5 (no section <6.0)',
  },
  {
    name: 'Denmark',
    slug: 'denmark',
    mdFiles: ['denmark-universities.md'],
    output: 'denmark-universities.json',
    sections: [
      { marker: '## 1. RESEARCH UNIVERSITIES', end: '## 2. UNIVERSITY COLLEGES', type: 'Public' },
      { marker: '## 2. UNIVERSITY COLLEGES', end: '## 3. BUSINESS ACADEMIES', type: 'Public' },
      { marker: '## 3. BUSINESS ACADEMIES', end: '## 4. ART', type: 'Public' },
      { marker: '## 4. ART', end: '## 5. MARITIME', type: 'Public' },
      { marker: '## 5. MARITIME', end: '## ADMISSION REQUIREMENTS', type: 'Public' },
    ],
    defaultBscReq: '12yr secondary + IELTS 6.0-6.5',
    defaultMscReq: 'BSc (180 ECTS) + IELTS 6.5',
  },
  {
    name: 'Netherlands',
    slug: 'netherlands',
    mdFiles: ['netherlands-universities.md'],
    output: 'netherlands-universities.json',
    sections: [
      { marker: '## 1.', end: '## 2.', type: 'Public' },
      { marker: '## 2.', end: '## 3.', type: 'Public' },
      { marker: '## 3.', end: '## 4.', type: 'Public' },
      { marker: '## 4.', end: '## 5.', type: 'Private' },
      { marker: '## 5.', end: '## 6.', type: 'Private' },
      { marker: '## 6.', end: '## 7.', type: 'Private' },
      { marker: '## 7.', end: '## QS', type: 'Private' },
    ],
    defaultBscReq: 'VWO diploma or equiv (12yr) + IELTS 6.0-6.5',
    defaultMscReq: 'BSc (180 ECTS) + IELTS 6.5',
  },
  {
    name: 'Austria',
    slug: 'austria',
    mdFiles: ['austria-universities.md'],
    output: 'austria-universities.json',
    sections: [
      { marker: '## 1.', end: '## 2.', type: 'Public' },
      { marker: '## 2.', end: '## 3.', type: 'Public' },
      { marker: '## 3.', end: '## 4.', type: 'Private' },
      { marker: '## 4.', end: '## 5.', type: 'Public' },
      { marker: '## 5.', end: '## ADMISSION', type: 'Public' },
    ],
    defaultBscReq: 'Matura/Abitur or equiv (12yr) + German B2 or English B2 (IELTS 6.0)',
    defaultMscReq: 'BSc (180 ECTS) + German B2 or English B2 (IELTS 6.5)',
  },
];

// ─── Parsing helpers ───
function parseMdTable(text) {
  const rows = [];
  for (const line of text.split('\n')) {
    if (!line.startsWith('|')) continue;
    if (line.includes('---')) continue;
    if (/\|\s*#\s*\|/.test(line)) continue;
    if (line.includes('~~')) continue;
    const cells = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
    if (cells.length >= 5) rows.push(cells);
  }
  return rows;
}

function extractSection(text, start, end) {
  const si = text.indexOf(start);
  if (si === -1) return '';
  const ei = end ? text.indexOf(end, si + start.length) : text.length;
  return text.substring(si, ei === -1 ? text.length : ei);
}

function parseFeeRange(str) {
  if (!str) return [0, 0];
  if (str.toLowerCase().includes('free')) return [0, 0];
  if (str.toLowerCase().includes('n/a')) return [0, 0];
  // Extract EUR amounts — look for (~€...) or €... patterns
  const eurMatch = str.match(/€([\d,]+)/g);
  if (eurMatch && eurMatch.length > 0) {
    const vals = eurMatch.map(m => parseInt(m.replace(/[€,]/g, ''), 10)).filter(n => !isNaN(n) && n > 5);
    if (vals.length === 0) return [0, 0];
    return [Math.min(...vals), Math.max(...vals)];
  }
  // Try DKK or SEK with EUR conversion in parentheses
  const approxEur = str.match(/~€([\d,]+)/);
  if (approxEur) {
    const v = parseInt(approxEur[1].replace(/,/g, ''), 10);
    return [v, v];
  }
  // Fallback: any numbers
  const nums = str.replace(/[€,SEKDKKyr\/]/gi, '').match(/\d+/g);
  if (nums) {
    const vals = nums.map(n => parseInt(n, 10)).filter(n => !isNaN(n) && n > 100);
    if (vals.length >= 2) return [Math.min(...vals), Math.max(...vals)];
    if (vals.length === 1) return [vals[0], vals[0]];
  }
  return [0, 0];
}

function getRegion(country, city) {
  const map = REGION_MAPS[country] || {};
  if (!city) return '';
  const clean = city.split('/')[0].split('(')[0].trim();
  return map[clean] || map[city] || '';
}

function cleanUrl(url) {
  if (!url) return '';
  url = url.trim();
  if (url.startsWith('http')) return url;
  if (url.includes('.')) return 'https://' + url;
  return '';
}

// ─── Main generator ───
function generateCountry(config) {
  let allText = '';
  for (const file of config.mdFiles) {
    const fpath = path.join(MD_DIR, file);
    if (fs.existsSync(fpath)) {
      allText += '\n' + fs.readFileSync(fpath, 'utf-8');
    } else {
      console.warn(`  Warning: ${file} not found`);
    }
  }

  const universities = [];
  let id = 1;

  for (const sec of config.sections) {
    const sectionText = extractSection(allText, sec.marker, sec.end);
    const rows = parseMdTable(sectionText);

    for (const cells of rows) {
      const idx = cells[0].match(/^\d+$/) ? 1 : 0;
      if (cells.length < idx + 5) continue;

      let name = (cells[idx] || '').replace(/\*\*/g, '').trim();
      let city = (cells[idx + 1] || '').replace(/\*\*/g, '').replace(/\(.*?\)/g, '').trim();

      if (!name || name.length < 3) continue;

      let bscFeeStr = '', mscFeeStr = '', bscReq = '', mscReq = '', website = '';

      // Find website cell (always the last meaningful cell)
      const allCells = cells.slice(idx);
      const webCellIdx = allCells.findIndex(c => c.includes('https://') || c.includes('http://'));

      if (webCellIdx >= 0 && webCellIdx >= 6) {
        // Full table: Name, City, [Type/QS], BscFee, MscFee, BscReq, MscReq, Website
        website = allCells[webCellIdx];
        mscReq = allCells[webCellIdx - 1] || '';
        bscReq = allCells[webCellIdx - 2] || '';
        mscFeeStr = allCells[webCellIdx - 3] || '';
        bscFeeStr = allCells[webCellIdx - 4] || '';
      } else if (webCellIdx >= 0 && webCellIdx >= 4) {
        // Short table: Name, City, Fee, Req, Website (or similar)
        website = allCells[webCellIdx];
        bscReq = allCells[webCellIdx - 1] || '';
        mscReq = bscReq;
        bscFeeStr = allCells[webCellIdx - 2] || '';
        mscFeeStr = bscFeeStr;
      } else {
        // Minimal: just try last cell as website
        website = allCells[allCells.length - 1] || '';
        if (!website.includes('http')) website = '';
      }

      // Skip if fee looks like a QS rank (e.g. "#101" or just a small number without €/SEK/DKK)
      if (bscFeeStr.startsWith('#') || (bscFeeStr.match(/^[\d—–-]+$/) && !bscFeeStr.includes('€'))) {
        bscFeeStr = '';
      }
      if (mscFeeStr.startsWith('#') || (mscFeeStr.match(/^[\d—–-]+$/) && !mscFeeStr.includes('€'))) {
        mscFeeStr = '';
      }

      // Parse fees
      const [bscMin, bscMax] = parseFeeRange(bscFeeStr);
      const [mscMin, mscMax] = parseFeeRange(mscFeeStr);
      const bscFee = Math.round((bscMin + bscMax) / 2) || 0;
      const mscFee = Math.round((mscMin + mscMax) / 2) || 0;

      const isFree = bscFeeStr.toLowerCase().includes('free') && mscFeeStr.toLowerCase().includes('free');

      // Cost category
      let costCategory = 'Free';
      const avg = (bscFee + mscFee) / 2;
      if (sec.type === 'Private' || sec.type === 'Church-Affiliated') {
        if (avg > 12000) costCategory = 'High';
        else if (avg > 5000) costCategory = 'Medium';
        else costCategory = 'Low';
      } else {
        if (isFree || avg === 0) costCategory = 'Free';
        else if (avg < 3000) costCategory = 'Free';
        else if (avg < 8000) costCategory = 'Low';
        else costCategory = 'Medium';
      }

      // Clean requirements
      if (!bscReq || bscReq.length < 5 || bscReq.includes('€') || bscReq.includes('http')) {
        bscReq = config.defaultBscReq;
      }
      if (!mscReq || mscReq.length < 5 || mscReq.includes('€') || mscReq.includes('http')) {
        mscReq = config.defaultMscReq;
      }

      // Override with verified fees if available
      const cleanName = name.replace(/\s*\(.*?\)\s*/g, '').trim();
      const verified = VERIFIED_FEES[name] || VERIFIED_FEES[cleanName] || null;

      const finalBscFee = verified ? verified.bsc : (isFree ? 0 : bscFee);
      const finalMscFee = verified ? verified.msc : (isFree ? 0 : mscFee);
      const finalNote = verified ? verified.note : `BSc: ${bscFeeStr || 'N/A'} | MSc: ${mscFeeStr || 'N/A'}`;
      const finalFree = verified ? (verified.bsc === 0 && verified.msc === 0) : isFree;

      // Recalculate cost category with verified fees
      const verifiedAvg = (finalBscFee + finalMscFee) / 2;
      let finalCostCat = costCategory;
      if (verified) {
        if (finalFree) finalCostCat = 'Free';
        else if (verifiedAvg > 12000) finalCostCat = 'High';
        else if (verifiedAvg > 5000) finalCostCat = 'Medium';
        else if (verifiedAvg > 0) finalCostCat = 'Low';
        else finalCostCat = 'Free';
      }

      universities.push({
        id: id++,
        name,
        localName: name,
        country: config.name,
        city: city.split('/')[0].trim(),
        state: getRegion(config.slug, city),
        type: sec.type,
        category: 'University',
        degreeTypes: ['Bachelor', 'Masters', 'PhD'],
        ranking: QS_RANKINGS[name] || QS_RANKINGS[cleanName] || null,
        bachelorTuitionEUR: finalBscFee,
        bachelorTuitionBDT: Math.round(finalBscFee * EUR_TO_BDT),
        masterTuitionEUR: finalMscFee,
        masterTuitionBDT: Math.round(finalMscFee * EUR_TO_BDT),
        semesterbeitrag: 0,
        isTuitionFree: finalFree,
        costCategory: finalCostCat,
        tuitionNote: finalNote,
        bachelorRequirements: bscReq,
        masterRequirements: mscReq,
        websiteUrl: cleanUrl(website),
      });
    }
  }

  return universities;
}

// ─── Run all countries ───
let totalGenerated = 0;
for (const config of COUNTRIES) {
  console.log(`\n=== ${config.name.toUpperCase()} ===`);
  const unis = generateCountry(config);

  const outPath = path.join(OUT_DIR, config.output);
  fs.writeFileSync(outPath, JSON.stringify(unis, null, 2), 'utf-8');

  const types = {};
  unis.forEach(u => { types[u.type] = (types[u.type] || 0) + 1; });
  const withState = unis.filter(u => u.state).length;

  console.log(`  Generated: ${unis.length} universities`);
  console.log(`  Types: ${JSON.stringify(types)}`);
  console.log(`  With region: ${withState}/${unis.length}`);
  console.log(`  Output: ${config.output}`);

  totalGenerated += unis.length;
}

console.log(`\n=== TOTAL: ${totalGenerated} universities across ${COUNTRIES.length} countries ===`);
