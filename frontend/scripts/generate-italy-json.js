/**
 * Script to parse italy-universities.md and generate italy-universities.json
 * Run: node scripts/generate-italy-json.js
 */
const fs = require('fs');
const path = require('path');

const ITALY_MD = path.join(__dirname, '../../italy-universities.md');
const OUTPUT = path.join(__dirname, '../public/data/italy-universities.json');

const { ITALY_REGIONS } = require('./city-to-region');
const { ITALY_VERIFIED } = require('./verified-fees');

const EUR_TO_BDT = 128;
let idCounter = 1;

// QS World University Rankings 2026 — Italy (verified from study.eu)
const qsRankings = {
  'Politecnico di Milano': 98,
  'Sapienza University of Rome': 128,
  'University of Bologna (UNIBO)': 138,
  'University of Padua (UNIPD)': 233,
  'Polytechnic University of Turin (PoliTo)': 242,
  'University of Milan (UniMi)': 276,
  'University of Pisa': 343,
  'University of Rome Tor Vergata': 355,
  'University of Naples Federico II': 379,
  'University of Florence (UniFi)': 404,
  'University of Turin (UniTo)': 408,
  'Università Cattolica del Sacro Cuore': 409,
  'University of Pavia': 423,
  'Vita-Salute San Raffaele University': 461,
  'University of Trento': 485,
  'University of Genoa': 530,
  'University of Milan-Bicocca': 542,
  'University of Siena': 607,
  'Free University of Bozen-Bolzano': 643,
  'University of Brescia': 650,
  'Ca\' Foscari University of Venice': 660,
  'University of Messina': 741,
  'University of Trieste': 751,
  'University of Modena and Reggio Emilia': 801,
  'University of Perugia': 801,
  'Polytechnic University of Bari': 801,
  'University of Salerno': 801,
  'Polytechnic University of the Marches': 801,
  'University of Palermo': 801,
  'University of Bari Aldo Moro': 801,
  'University of Verona': 851,
  'Tuscia University': 851,
  'University of Catania': 851,
  'Roma Tre University': 901,
  'University of Calabria': 951,
  'University of Ferrara': 951,
  'Parthenope University of Naples': 1001,
  'University of Salento': 1001,
  'University of Parma': 1001,
  'D\'Annunzio University Chieti-Pescara': 1001,
  'University of Udine': 1001,
  'University of Urbino Carlo Bo': 1201,
  'University of Bergamo': 1401,
  'Bocconi University': null, // QS MBA #7 but no overall rank
};

function parseMdTable(text) {
  const rows = [];
  const lines = text.split('\n');
  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    if (line.includes('---')) continue;
    if (line.includes('| # |') || line.includes('| #|')) continue;
    if (line.includes('~~')) continue; // skip strikethrough
    const cells = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
    if (cells.length >= 5) rows.push(cells);
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
  if (!feeStr) return [0, 0];
  if (feeStr.toLowerCase().includes('free')) return [0, 0];
  if (feeStr.toLowerCase().includes('n/a')) return [0, 0];
  const nums = feeStr.replace(/[€,]/g, '').match(/[\d]+/g);
  if (!nums || nums.length === 0) return [0, 0];
  const values = nums.map(n => parseInt(n, 10)).filter(n => !isNaN(n) && n > 10);
  if (values.length === 0) return [0, 0];
  if (values.length === 1) return [values[0], values[0]];
  return [Math.min(...values), Math.max(...values)];
}

function inferCategory(name) {
  const n = name.toLowerCase();
  if (n.includes('politecnico') || n.includes('polytechnic')) return 'Technical University';
  if (n.includes('bocconi') || n.includes('luiss') || n.includes('liuc')) return 'Business School';
  if (n.includes('scuola normale') || n.includes('sant\'anna') || n.includes('sissa') || n.includes('imt ') || n.includes('iuss')) return 'Superior Graduate School';
  if (n.includes('stranieri') || n.includes('foreigners')) return 'Language University';
  if (n.includes('iuav') || n.includes('architecture')) return 'Architecture University';
  if (n.includes('foro italico') || n.includes('sport')) return 'Sport University';
  if (n.includes('cattolica') || n.includes('lumsa') || n.includes('european university of rome')) return 'Catholic University';
  if (n.includes('humanitas') || n.includes('unicamillus') || n.includes('san raffaele') || n.includes('biomedic')) return 'Medical University';
  if (n.includes('gastronomic')) return 'Specialized University';
  if (n.includes('telematic') || n.includes('online') || n.includes('cusano') || n.includes('pegaso') || n.includes('marconi') || n.includes('mercatorum') || n.includes('unitelma') || n.includes('nettuno') || n.includes('e-campus') || n.includes('fortunato')) return 'Online University';
  return 'University';
}

function parseItalyMd(text) {
  const universities = [];

  // Parse sections
  const sections = [
    // Public universities (multiple sub-sections under "## 1. PUBLIC UNIVERSITIES")
    { marker: '## 1. PUBLIC UNIVERSITIES', end: '## 2. PRIVATE UNIVERSITIES', type: 'Public' },
    // Private universities
    { marker: '## 2. PRIVATE UNIVERSITIES', end: '## 3. ONLINE', type: 'Private' },
    // Online universities
    { marker: '## 3. ONLINE', end: '## ADMISSION REQUIREMENTS', type: 'Private' },
  ];

  for (const sec of sections) {
    const sectionText = extractSection(text, sec.marker, sec.end);
    const rows = parseMdTable(sectionText);

    for (const cells of rows) {
      const idx = cells[0].match(/^\d+$/) ? 1 : 0;

      // The Italy .md tables have varying structures:
      // Public: #, Name, City, QS, BscFee, MscFee, BscReq, MscReq, Website
      // Private: #, Name, City, QS, BscFee, MscFee, BscReq, MscReq, Website
      // Online: #, Name, City, Fee, BscReq, MscReq, Website
      // Superior Schools: #, School, City, QS, Tuition, Requirements, Website

      let name = cells[idx] || '';
      let city = cells[idx + 1] || '';
      let bscFeeStr = '', mscFeeStr = '', bscReq = '', mscReq = '', website = '';

      // Try to detect which table format
      if (cells.length >= 9) {
        // Full format: #, Name, City, QS, BscFee, MscFee, BscReq, MscReq, Website
        bscFeeStr = cells[idx + 3] || '';
        mscFeeStr = cells[idx + 4] || '';
        bscReq = cells[idx + 5] || '';
        mscReq = cells[idx + 6] || '';
        website = cells[idx + 7] || '';
      } else if (cells.length >= 7) {
        // Online/Superior format: #, Name, City, Fee, BscReq, MscReq, Website
        bscFeeStr = cells[idx + 2] || '';
        mscFeeStr = cells[idx + 2] || ''; // same fee
        bscReq = cells[idx + 3] || '';
        mscReq = cells[idx + 4] || '';
        website = cells[idx + 5] || '';
      } else if (cells.length >= 6) {
        // Short format: #, Name, City, QS, Fee, Req, Website
        bscFeeStr = cells[idx + 3] || '';
        mscFeeStr = cells[idx + 3] || '';
        bscReq = cells[idx + 4] || '';
        mscReq = bscReq;
        website = cells[idx + 5] || '';
      } else {
        continue;
      }

      if (!name || name.length < 3) continue;

      // Clean name — remove markdown bold
      name = name.replace(/\*\*/g, '').trim();
      city = city.replace(/\*\*/g, '').replace(/\(.*?\)/g, '').trim();

      // Parse fees
      const [bscMin, bscMax] = parseFeeRange(bscFeeStr);
      const [mscMin, mscMax] = parseFeeRange(mscFeeStr);
      const bscFee = Math.round((bscMin + bscMax) / 2) || 0;
      const mscFee = Math.round((mscMin + mscMax) / 2) || 0;

      // Check if it's a free institution (Superior Graduate Schools)
      const isFree = bscFeeStr.toLowerCase().includes('free') || mscFeeStr.toLowerCase().includes('free');
      const isSuperior = name.includes('Normale') || name.includes('Sant\'Anna') || name.includes('SISSA') || name.includes('IMT ') || name.includes('IUSS');

      // Cost category
      let costCategory = 'Free';
      const avgFee = (bscFee + mscFee) / 2;
      if (sec.type === 'Private') {
        if (avgFee > 12000) costCategory = 'High';
        else if (avgFee > 5000) costCategory = 'Medium';
        else costCategory = 'Low';
      } else {
        if (isFree || isSuperior) costCategory = 'Free';
        else if (avgFee > 3000) costCategory = 'Low';
        else costCategory = 'Free';
      }

      // Website
      const cleanUrl = (website || '').trim();
      const finalUrl = cleanUrl.startsWith('http') ? cleanUrl : (cleanUrl ? `https://${cleanUrl}` : '');

      // Category
      const category = inferCategory(name);

      // Tuition note
      let tuitionNote = '';
      if (isFree || isSuperior) {
        tuitionNote = 'FREE tuition + monthly stipend (~€500/mo)';
      } else if (sec.type === 'Public') {
        tuitionNote = `ISEE-based: BSc ${bscFeeStr} | MSc ${mscFeeStr} — low-income students pay €150-€500/yr`;
      } else {
        tuitionNote = `BSc ${bscFeeStr} | MSc ${mscFeeStr}`;
      }

      // Requirements defaults
      if (!bscReq || bscReq.length < 5) {
        bscReq = '12yr secondary + Italian B2 (CILS/CELI) or IELTS 5.5-6.0';
      }
      if (!mscReq || mscReq.length < 5) {
        mscReq = 'Laurea/BSc (180 ECTS) + Italian B2 or IELTS 6.0-6.5';
      }

      // Override with verified fees if available
      const verified = ITALY_VERIFIED[name] || null;
      const finalBsc = verified ? verified.bsc : (isFree ? 0 : bscFee);
      const finalMsc = verified ? verified.msc : (isFree ? 0 : mscFee);
      const finalNote = verified ? verified.note : tuitionNote;
      const finalFree = (isFree || isSuperior) && !verified;

      const uni = {
        id: idCounter++,
        name: name,
        localName: name,
        country: 'Italy',
        city: city,
        state: ITALY_REGIONS[city] || ITALY_REGIONS[city.split('/')[0].trim()] || ITALY_REGIONS[city.split('(')[0].trim()] || '',
        type: sec.type,
        category: category,
        degreeTypes: isSuperior ? ['Masters', 'PhD'] : (category === 'Online University' ? ['Bachelor', 'Masters'] : ['Bachelor', 'Masters', 'PhD']),
        ranking: qsRankings[name] || null,
        bachelorTuitionEUR: finalBsc,
        bachelorTuitionBDT: Math.round(finalBsc * EUR_TO_BDT),
        masterTuitionEUR: finalMsc,
        masterTuitionBDT: Math.round(finalMsc * EUR_TO_BDT),
        semesterbeitrag: 0,
        isTuitionFree: finalFree,
        costCategory: costCategory,
        tuitionNote: finalNote,
        bachelorRequirements: bscReq,
        masterRequirements: mscReq,
        websiteUrl: finalUrl,
      };

      universities.push(uni);
    }
  }

  return universities;
}

// Main
try {
  const mdContent = fs.readFileSync(ITALY_MD, 'utf-8');
  const universities = parseItalyMd(mdContent);

  fs.writeFileSync(OUTPUT, JSON.stringify(universities, null, 2), 'utf-8');

  console.log(`Generated ${universities.length} Italian universities`);
  const types = {};
  const categories = {};
  universities.forEach(u => {
    types[u.type] = (types[u.type] || 0) + 1;
    categories[u.category] = (categories[u.category] || 0) + 1;
  });
  console.log('By type:', types);
  console.log('By category:', categories);
  console.log('QS ranked:', universities.filter(u => u.ranking).length);
  console.log('Free:', universities.filter(u => u.isTuitionFree).length);
  console.log(`Output: ${OUTPUT}`);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
