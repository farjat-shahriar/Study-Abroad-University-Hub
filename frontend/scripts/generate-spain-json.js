/**
 * Script to parse spain-universities.md and generate spain-universities.json
 * Run: node scripts/generate-spain-json.js
 */
const fs = require('fs');
const path = require('path');

const SPAIN_MD = path.join(__dirname, '../../spain-universities.md');
const OUTPUT = path.join(__dirname, '../public/data/spain-universities.json');

const { SPAIN_REGIONS } = require('./city-to-region');

// Verified fees from official sources
const SPAIN_VERIFIED = {
  'University of Barcelona': { bsc: 4400, msc: 6600, note: 'Catalonia: ~€73/ECTS BSc, ~€110/ECTS MSc non-EU (ub.edu)' },
  'Autonomous University of Barcelona': { bsc: 4400, msc: 6600, note: 'Catalonia rates (uab.cat)' },
  'Pompeu Fabra University': { bsc: 4400, msc: 6600, note: 'Catalonia rates (upf.edu)' },
  'Polytechnic University of Catalonia': { bsc: 4400, msc: 6600, note: 'Catalonia rates (upc.edu)' },
  'Complutense University of Madrid': { bsc: 2700, msc: 2700, note: 'Madrid: ~€45/ECTS non-EU (ucm.es)' },
  'Autonomous University of Madrid': { bsc: 2700, msc: 2700, note: 'Madrid: ~€45/ECTS non-EU (uam.es)' },
  'Carlos III University of Madrid': { bsc: 3200, msc: 4500, note: 'Madrid rates, higher for engineering (uc3m.es)' },
  'Technical University of Madrid': { bsc: 2700, msc: 2700, note: 'Madrid: ~€45/ECTS non-EU (upm.es)' },
  'King Juan Carlos University': { bsc: 2700, msc: 2700, note: 'Madrid rates (urjc.es)' },
  'University of Granada': { bsc: 757, msc: 821, note: 'Andalusia: same rate EU/non-EU — cheapest (ugr.es)' },
  'University of Seville': { bsc: 757, msc: 821, note: 'Andalusia: same rate EU/non-EU (us.es)' },
  'University of Málaga': { bsc: 757, msc: 821, note: 'Andalusia: same rate EU/non-EU (uma.es)' },
  'University of Córdoba': { bsc: 757, msc: 821, note: 'Andalusia: same rate EU/non-EU (uco.es)' },
  'University of Cádiz': { bsc: 757, msc: 821, note: 'Andalusia: same rate EU/non-EU (uca.es)' },
  'University of Jaén': { bsc: 757, msc: 821, note: 'Andalusia: same rate EU/non-EU (ujaen.es)' },
  'University of Almería': { bsc: 757, msc: 821, note: 'Andalusia: same rate EU/non-EU (ual.es)' },
  'University of Huelva': { bsc: 757, msc: 821, note: 'Andalusia: same rate EU/non-EU (uhu.es)' },
  'University of Valencia': { bsc: 1500, msc: 2500, note: 'Valencia region rates (uv.es)' },
  'Polytechnic University of Valencia': { bsc: 1500, msc: 2500, note: 'Valencia region rates (upv.es)' },
  'University of Santiago de Compostela': { bsc: 836, msc: 1200, note: 'Galicia: same rate EU/non-EU (usc.gal)' },
  'University of A Coruña': { bsc: 836, msc: 1200, note: 'Galicia rates (udc.es)' },
  'University of Vigo': { bsc: 836, msc: 1200, note: 'Galicia rates (uvigo.gal)' },
  'University of Salamanca': { bsc: 1500, msc: 2500, note: 'Castilla y León rates (usal.es)' },
  'University of the Basque Country': { bsc: 1800, msc: 3000, note: 'Basque Country rates (ehu.eus)' },
  'University of Zaragoza': { bsc: 1500, msc: 2500, note: 'Aragon rates (unizar.es)' },
  'IE University': { bsc: 18500, msc: 27500, note: 'Private — verified (ie.edu)' },
  'University of Navarra': { bsc: 12500, msc: 16000, note: 'Private Catholic (unav.edu)' },
  'Comillas Pontifical University': { bsc: 13000, msc: 16000, note: 'Private Catholic (comillas.edu)' },
  'European University of Madrid': { bsc: 11000, msc: 14000, note: 'Private (universidadeuropea.com)' },
  'Ramon Llull University': { bsc: 11000, msc: 14000, note: 'Private Catholic (url.edu)' },
};

const EUR_TO_BDT = 128;
let idCounter = 1;

// ══════════════════════════════════════════════
// QS World University Rankings 2026 — Spain
// Source: study.eu, topuniversities.com
// ══════════════════════════════════════════════
const qsRankings = {
  'University of Barcelona': 160,
  'Autonomous University of Barcelona': 172,
  'Complutense University of Madrid': 187,
  'Autonomous University of Madrid': 206,
  'University of Navarra': 262,
  'Pompeu Fabra University': 265,
  'Carlos III University of Madrid': 301,
  'Technical University of Madrid': 334,
  'Polytechnic University of Catalonia': 392,
  'University of Granada': 401,
  'Polytechnic University of Valencia': 422,
  'University of Valencia': 430,
  'Ramon Llull University': 436,
  'IE University': 438,
  'University of Seville': 469,
  'University of Salamanca': 526,
  'Comillas Pontifical University': 581,
  'University of the Basque Country': 624,
  'University of Santiago de Compostela': 628,
  'University of Zaragoza': 638,
  'University of Alcalá': 697,
  'Rovira i Virgili University': 771,
  'University of Alicante': 781,
  'University of Vigo': 851,
  'European University of Madrid': 901,
  'University of Valladolid': 901,
  'University of Oviedo': 901,
  'University of Córdoba': 951,
  'Jaume I University': 1001,
  'University of Deusto': 1001,
  'University of Murcia': 1001,
  'University of Lleida': 1001,
  'University of A Coruña': 1001,
  'King Juan Carlos University': 1001,
  'University of León': 1001,
  'University of Castilla–La Mancha': 1001,
  'CEU San Pablo University': 1001,
  'San Antonio Catholic University of Murcia': 1201,
};

function parseMdTable(text) {
  const rows = [];
  const lines = text.split('\n');
  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    if (line.includes('---')) continue;
    if (line.includes('| # |') || line.includes('| #|')) continue;
    const cells = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
    if (cells.length >= 6) rows.push(cells);
  }
  return rows;
}

function extractSection(text, startMarker, endMarker) {
  const startIdx = text.indexOf(startMarker);
  if (startIdx === -1) return '';
  const endIdx = endMarker ? text.indexOf(endMarker, startIdx + startMarker.length) : text.length;
  return text.substring(startIdx, endIdx === -1 ? text.length : endIdx);
}

function parseFeeRange(feeStr) {
  // Parse "€800–€1,500" or "€5,000–€20,000" into [min, max]
  const nums = feeStr.replace(/[€,]/g, '').match(/[\d,]+/g);
  if (!nums || nums.length === 0) return [0, 0];
  const values = nums.map(n => parseInt(n.replace(/,/g, ''), 10)).filter(n => !isNaN(n));
  if (values.length === 1) return [values[0], values[0]];
  return [Math.min(...values), Math.max(...values)];
}

function parseSpainMd(text) {
  const universities = [];

  const sections = [
    { marker: '## 1. PUBLIC UNIVERSITIES', end: '## 2. PRIVATE UNIVERSITIES', type: 'Public' },
    { marker: '## 2. PRIVATE UNIVERSITIES', end: '## 3. CATHOLIC', type: 'Private' },
    { marker: '## 3. CATHOLIC', end: '## ADMISSION REQUIREMENTS', type: 'Church-Affiliated' },
  ];

  for (const sec of sections) {
    const sectionText = extractSection(text, sec.marker, sec.end);
    const rows = parseMdTable(sectionText);

    for (const cells of rows) {
      // Skip "see #1" references and duplicates
      const rowText = cells.join(' ');
      if (rowText.includes('see #') || rowText.includes('(see ')) continue;

      const idx = cells[0].match(/^\d+$/) ? 1 : 0;

      let name, city, state, bscFeeStr, mscFeeStr, bscReq, mscReq, website;

      if (sec.type === 'Public') {
        // Public: #, Name, City, QS, BscFee, MscFee, BscReq, MscReq, Website
        // OR (Other Regions): #, Name, City, Region, QS, BscFee, MscFee, BscReq, MscReq, Website
        if (cells.length >= 10) {
          // Other Regions table has Region column
          name = cells[idx];
          city = cells[idx + 1];
          state = cells[idx + 2];
          // QS at idx+3
          bscFeeStr = cells[idx + 4] || '';
          mscFeeStr = cells[idx + 5] || '';
          bscReq = cells[idx + 6] || '';
          mscReq = cells[idx + 7] || '';
          website = cells[idx + 8] || '';
        } else if (cells.length >= 9) {
          name = cells[idx];
          city = cells[idx + 1];
          state = '';
          // QS at idx+2
          bscFeeStr = cells[idx + 3] || '';
          mscFeeStr = cells[idx + 4] || '';
          bscReq = cells[idx + 5] || '';
          mscReq = cells[idx + 6] || '';
          website = cells[idx + 7] || '';
        } else {
          continue;
        }
      } else {
        // Private/Catholic: #, Name, City, Region, QS, BscFee, MscFee, BscReq, MscReq, Website
        if (cells.length >= 10) {
          name = cells[idx];
          city = cells[idx + 1];
          state = cells[idx + 2];
          bscFeeStr = cells[idx + 4] || '';
          mscFeeStr = cells[idx + 5] || '';
          bscReq = cells[idx + 6] || '';
          mscReq = cells[idx + 7] || '';
          website = cells[idx + 8] || '';
        } else if (cells.length >= 9) {
          name = cells[idx];
          city = cells[idx + 1];
          state = cells[idx + 2] || '';
          bscFeeStr = cells[idx + 3] || '';
          mscFeeStr = cells[idx + 4] || '';
          bscReq = cells[idx + 5] || '';
          mscReq = cells[idx + 6] || '';
          website = cells[idx + 7] || '';
        } else {
          continue;
        }
      }

      if (!name || !city) continue;

      // Parse fee ranges
      const [bscMin, bscMax] = parseFeeRange(bscFeeStr);
      const [mscMin, mscMax] = parseFeeRange(mscFeeStr);

      // Use average of range as the representative fee
      const bscFee = Math.round((bscMin + bscMax) / 2) || 0;
      const mscFee = Math.round((mscMin + mscMax) / 2) || 0;

      // Determine if tuition free
      const isFree = sec.type === 'Public' && bscFee < 2000;

      // Cost category
      let costCategory = 'Free';
      const avgFee = (bscFee + mscFee) / 2;
      if (sec.type === 'Private' || sec.type === 'Church-Affiliated') {
        if (avgFee > 15000) costCategory = 'High';
        else if (avgFee > 8000) costCategory = 'Medium';
        else costCategory = 'Low';
      } else {
        if (avgFee > 3000) costCategory = 'Low';
        else costCategory = 'Free';
      }

      // Clean website
      const cleanWebsite = (website || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
      const finalWebsite = website && website.startsWith('http') ? website : (cleanWebsite ? `https://${cleanWebsite}` : '');

      // Tuition note
      let tuitionNote = '';
      if (sec.type === 'Public') {
        tuitionNote = `BSc: ${bscFeeStr} | MSc: ${mscFeeStr} (non-EU, varies by region)`;
      } else {
        tuitionNote = `BSc: ${bscFeeStr} | MSc: ${mscFeeStr}`;
      }

      // Determine category
      let category = 'University';
      const n = name.toLowerCase();
      if (n.includes('polytechnic') || n.includes('politécnica') || n.includes('technical')) category = 'Technical University';
      else if (n.includes('distance') || n.includes('uned') || n.includes('udima') || n.includes('unir') || n.includes('open university') || n.includes('uoc')) category = 'Distance University';
      else if (n.includes('catholic') || n.includes('católica') || n.includes('pontifical') || n.includes('pontificia') || n.includes('ceu') || n.includes('san damaso') || n.includes('les roches')) category = 'Catholic/Church University';
      else if (n.includes('ie university')) category = 'Business School';

      const uni = {
        id: idCounter++,
        name: name,
        localName: name, // Spanish names are often the same
        country: 'Spain',
        city: city.replace(/\s*\/\s*.*/g, '').trim(),
        state: state || SPAIN_REGIONS[city.replace(/\s*\/\s*.*/g, '').replace(/\s*\(.*\)/, '').trim()] || SPAIN_REGIONS[city.split('/')[0].trim()] || '',
        type: sec.type,
        category: category,
        degreeTypes: category === 'Distance University' ? ['Bachelor', 'Masters'] : ['Bachelor', 'Masters', 'PhD'],
        ranking: qsRankings[name] || null,
        bachelorTuitionEUR: (SPAIN_VERIFIED[name] || {}).bsc || bscFee,
        bachelorTuitionBDT: Math.round(((SPAIN_VERIFIED[name] || {}).bsc || bscFee) * EUR_TO_BDT),
        masterTuitionEUR: (SPAIN_VERIFIED[name] || {}).msc || mscFee,
        masterTuitionBDT: Math.round(((SPAIN_VERIFIED[name] || {}).msc || mscFee) * EUR_TO_BDT),
        semesterbeitrag: 0,
        isTuitionFree: false,
        costCategory: costCategory,
        tuitionNote: (SPAIN_VERIFIED[name] || {}).note || tuitionNote,
        bachelorRequirements: bscReq || 'Bachillerato/12yr + Selectividad/PCE + Spanish B2 or IELTS 6.0',
        masterRequirements: mscReq || 'Grado/BSc (240 ECTS) + Spanish B2 or IELTS 6.0-6.5',
        websiteUrl: finalWebsite,
      };

      universities.push(uni);
    }
  }

  return universities;
}

// Main
try {
  const mdContent = fs.readFileSync(SPAIN_MD, 'utf-8');
  const universities = parseSpainMd(mdContent);

  fs.writeFileSync(OUTPUT, JSON.stringify(universities, null, 2), 'utf-8');

  console.log(`Generated ${universities.length} Spanish universities`);

  const types = {};
  universities.forEach(u => { types[u.type] = (types[u.type] || 0) + 1; });
  console.log('By type:', types);

  const ranked = universities.filter(u => u.ranking);
  console.log(`QS ranked: ${ranked.length}`);
  console.log(`Output: ${OUTPUT}`);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
