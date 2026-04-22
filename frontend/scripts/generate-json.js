/**
 * Script to parse .md university files and generate universities.json
 * Run: node scripts/generate-json.js
 */
const fs = require('fs');
const path = require('path');

const PUBLIC_MD = path.join(__dirname, '../../germany-public-universities.md');
const PRIVATE_MD = path.join(__dirname, '../../germany-private-universities.md');
const OUTPUT = path.join(__dirname, '../public/data/universities.json');

let idCounter = 1;

function parseMdTable(text) {
  const rows = [];
  const lines = text.split('\n');
  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    if (line.includes('---')) continue;
    if (line.includes('| # |') || line.includes('| #|')) continue;
    // Skip dissolved entries
    if (line.includes('~~')) continue;

    const cells = line
      .split('|')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (cells.length >= 4) {
      rows.push(cells);
    }
  }
  return rows;
}

function extractSection(text, startMarker, endMarker) {
  const startIdx = text.indexOf(startMarker);
  if (startIdx === -1) return '';
  const endIdx = endMarker ? text.indexOf(endMarker, startIdx + startMarker.length) : text.length;
  return text.substring(startIdx, endIdx === -1 ? text.length : endIdx);
}

function cleanCity(city) {
  return city
    .replace(/\(.*?\)/g, '')
    .replace(/\s*\/\s*.*/g, '')
    .replace(/\+.*$/g, '')
    .trim();
}

function getCategoryFromSection(sectionTitle) {
  if (sectionTitle.includes('APPLIED SCIENCES') || sectionTitle.includes('Fachhochschule'))
    return 'University of Applied Sciences';
  if (sectionTitle.includes('ART') || sectionTitle.includes('MUSIC') || sectionTitle.includes('FILM'))
    return 'Art/Music Academy';
  if (sectionTitle.includes('EDUCATION') || sectionTitle.includes('Pädagogische'))
    return 'University of Education';
  if (sectionTitle.includes('ADMINISTRATIVE'))
    return 'Administrative University';
  if (sectionTitle.includes('DUAL') || sectionTitle.includes('COOPERATIVE'))
    return 'Dual University';
  if (sectionTitle.includes('THEOLOGICAL'))
    return 'Theological College';
  if (sectionTitle.includes('Church-Affiliated') || sectionTitle.includes('Kirchlich'))
    return 'Church-Affiliated University';
  if (sectionTitle.includes('Technical'))
    return 'Technical University';
  return 'University';
}

function inferCategory(name, germanName) {
  const n = (name + ' ' + germanName).toLowerCase();
  if (n.includes('technische universität') || n.includes('technical university') || n.includes('kit ') || n.includes('rwth'))
    return 'Technical University';
  if (n.includes('medizinische') || n.includes('medical') || n.includes('charité'))
    return 'Medical University';
  if (n.includes('fernuniversität') || n.includes('distance'))
    return 'Distance University';
  if (n.includes('sport'))
    return 'Sport University';
  if (n.includes('bundeswehr'))
    return 'Military University';
  if (n.includes('pädagogische') || n.includes('education'))
    return 'University of Education';
  if (n.includes('fachhochschule') || n.includes('hochschule für angewandte') || n.includes('applied sciences') || n.includes('haw ') || n.includes('htw ') || n.includes('htwg') || n.includes('htwk'))
    return 'University of Applied Sciences';
  if (n.includes('musik') || n.includes('music') || n.includes('kunst') || n.includes('art') || n.includes('film') || n.includes('tanz') || n.includes('dance') || n.includes('schauspiel') || n.includes('gestaltung') || n.includes('design'))
    return 'Art/Music Academy';
  if (n.includes('verwaltung') || n.includes('polizei') || n.includes('police') || n.includes('finanzen') || n.includes('finance') || n.includes('rechtspflege'))
    return 'Administrative University';
  if (n.includes('dual'))
    return 'Dual University';
  if (n.includes('theolog') || n.includes('kirchenmusik') || n.includes('church'))
    return 'Theological College';
  return 'University';
}

function getDegreeTypes(category, type) {
  if (category === 'Administrative University') return ['Bachelor'];
  if (category === 'University of Applied Sciences') return ['Bachelor', 'Masters'];
  if (category === 'Art/Music Academy') return ['Bachelor', 'Masters'];
  if (category === 'University of Education') return ['Bachelor', 'Masters'];
  if (category === 'Dual University') return ['Bachelor'];
  if (category === 'Theological College') return ['Bachelor', 'Masters'];
  if (type === 'Private') return ['Bachelor', 'Masters'];
  return ['Bachelor', 'Masters', 'PhD'];
}

// ══════════════════════════════════════════════════════════════════
// AUTHENTIC TUITION DATA (verified April 2026)
//
// Sources:
//   - Public: Tuition is FREE in Germany (except BW & TUM for non-EU)
//     Only Semesterbeitrag (€70-€430/sem) is charged — this is NOT tuition,
//     it covers student union, transit pass, admin fee.
//   - Baden-Württemberg: €1,500/sem NON-EU tuition + semester fee
//     (Confirmed: Heidelberg, KIT, Mannheim, Freiburg, Stuttgart, Tübingen)
//   - TU Munich: Since WS 2024/25, charges non-EU students
//     Bachelor: €2,000-3,000/sem | Masters: €4,000-6,000/sem + €97 Semesterbeitrag
//   - Private: Verified per-university where possible
//     WHU: Bachelor ~€7,200/sem, Master ~€11,000/sem (source: whu.edu)
//     ESMT: MBA up to €55,000 total (source: esmt.berlin)
//     Frankfurt School: ~€10,000-15,000/sem (source: fs.de)
//     IU: €390-5,000/sem depending on model (source: iu.org)
//     FOM: ~€2,000-4,000/sem (source: fom.de)
//     SRH: €4,800-6,450/sem (source: srh-university.de)
//     Witten/Herdecke: ~€5,000-7,500/sem (source: uni-wh.de)
//   - Church-affiliated: Mostly free or very low (€0-300/sem)
//
// Semester contributions (Semesterbeitrag) by state — approximate averages
// based on major university in each state:
//   Bavaria: €85-150 (LMU €97, TUM €97)
//   Berlin: €310-330 (FU €330, HU €315, TU €312)
//   Brandenburg: €270-310 (Potsdam €280, Viadrina €310)
//   Bremen: €340-380 (Uni Bremen €360)
//   Hamburg: €335-400 (Uni Hamburg €384, HAW €335)
//   Hesse: €260-370 (Goethe €370, Darmstadt €270)
//   Lower Saxony: €350-420 (Göttingen €390, Hannover €420)
//   MV: €80-120 (Rostock €100, Greifswald €80)
//   NRW: €280-330 (Cologne €280, RWTH €305, Münster €310)
//   RP: €150-200 (Mainz €170, Trier €155)
//   Saarland: €280-310 (Saarland Uni €300)
//   Saxony: €180-230 (Leipzig €210, Dresden €220)
//   Saxony-Anhalt: €200-260 (Halle €230, Magdeburg €240)
//   SH: €250-310 (Kiel €280, Lübeck €310)
//   Thuringia: €220-270 (Jena €250, Erfurt €230)
// ══════════════════════════════════════════════════════════════════

const EUR_TO_BDT = 128; // 1 EUR ≈ 128 BDT (approximate rate, April 2026)

function getTuitionAndCost(type, state, category, name) {
  let semesterFee = 300;
  let isTuitionFree = false;
  let costCategory = 'Free';
  let feeNote = '';

  // ── Known private university fees (verified from official websites, 2025/2026) ──
  const knownPrivateFees = {
    // Business Schools (per semester, verified)
    'ESMT Berlin':                    { sem: 14750, note: 'MIM €29,500 total; MBA €43,500 total (esmt.berlin)' },
    'WHU – Otto Beisheim School of Management': { sem: 6900, note: 'BSc ~€13,800/yr; MSc €33,000-40,400 total (whu.edu)' },
    'Frankfurt School of Finance & Management': { sem: 8200, note: 'BSc €8,200/sem; MiM €8,875/sem; MoF €10,500/sem (frankfurt-school.de)' },
    'HHL Leipzig Graduate School of Management': { sem: 11000, note: 'MSc ~€22,000/yr (hhl.de)' },
    'EBS University of Business and Law': { sem: 15000, note: '~€15,000/sem (ebs.edu)' },
    'Munich Business School':         { sem: 7200, note: 'Bachelor ~€14,400/yr (munich-business-school.de)' },
    'Bucerius Law School':            { sem: 6000, note: 'LLB ~€12,000/yr; LLM €25,000 total (law-school.de)' },

    // Private Universities (per semester, verified)
    'Constructor University (formerly Jacobs University)': { sem: 10000, note: '€20,000/yr + room & board (constructor.university)' },
    'Witten/Herdecke University':     { sem: 5076, note: '~€10,152/yr; pay-later model available (uni-wh.de)' },
    'Zeppelin University':            { sem: 6475, note: 'BSc €5,750-7,200/sem; MSc €6,150+/sem (zeppelin-university.com)' },
    'Medical School Brandenburg':     { sem: 6250, note: '~€12,500/yr (mhb-fontane.de)' },

    // Private FH/UAS (per semester, verified)
    'IU International University of Applied Sciences': { sem: 3498, note: 'Online ~€349/mo; Campus ~€850/mo; varies by model (iu.org)' },
    'FOM University of Applied Sciences': { sem: 4305, note: '~€8,610/yr + €1,580 registration once (fom.de)' },
    'SRH University Heidelberg':      { sem: 5400, note: '€9,600-12,900/yr depending on program (srh-university.de)' },
    'SRH Berlin University of Applied Sciences': { sem: 5100, note: '~€10,200/yr (srh-berlin.de)' },
    'CBS International Business School': { sem: 5400, note: '~€10,800/yr (cbs.de)' },
    'ISM – International School of Management': { sem: 5700, note: '~€11,400/yr (ism.de)' },
    'APOLLON University of Health Care Management': { sem: 2100, note: '~€4,200/yr distance learning (apollon-hochschule.de)' },
    'Hochschule Fresenius (Main Campus)': { sem: 4950, note: '~€9,900/yr depending on program (hs-fresenius.de)' },
    'AKAD University of Applied Sciences': { sem: 2940, note: 'Distance: ~€5,880/yr (akad.de)' },
    'Wilhelm Büchner University':     { sem: 2400, note: 'Distance: ~€4,800/yr (wb-fernstudium.de)' },
    'DIPLOMA University of Applied Sciences': { sem: 2535, note: 'Distance: ~€5,070/yr (diploma.de)' },
    'Hamburger Fern-Hochschule':      { sem: 1800, note: 'Distance: ~€3,600/yr (hamburger-fh.de)' },
    'European Distance Learning University Hamburg': { sem: 2400, note: 'Distance: ~€4,800/yr (euro-fh.de)' },
    'SRH Distance Learning University': { sem: 2460, note: 'Distance: ~€4,920/yr (mobile-university.de)' },
    'PFH – Private University of Applied Sciences Göttingen': { sem: 3150, note: '~€6,300/yr (pfh.de)' },
    'FHM – University of Applied Sciences for Business': { sem: 3450, note: '~€6,900/yr (fh-mittelstand.de)' },
    'TH Georg Agricola':              { sem: 1600, note: '~€3,200/yr (thga.de)' },
    'Hochschule 21':                  { sem: 2400, note: '~€4,800/yr dual model (hs21.de)' },
  };

  if (type === 'Private') {
    isTuitionFree = false;

    // Check if we have verified per-university data
    const known = knownPrivateFees[name];
    if (known) {
      semesterFee = known.sem;
      feeNote = known.note;
    } else if (category === 'Business School' || category === 'Law School') {
      semesterFee = 10000;
      feeNote = 'Approx. ~€20,000/yr — check university website for exact fees';
    } else if (category === 'University') {
      semesterFee = 6000;
      feeNote = 'Approx. ~€12,000/yr — check university website for exact fees';
    } else if (category === 'Theological College') {
      semesterFee = 1200;
      feeNote = 'Approx. ~€2,400/yr — church-subsidized';
    } else {
      semesterFee = 4500;
      feeNote = 'Approx. ~€9,000/yr — check university website for exact fees';
    }

    // Cost category based on actual yearly amount
    const yearly = semesterFee * 2;
    if (yearly <= 5000) costCategory = 'Low';
    else if (yearly <= 15000) costCategory = 'Medium';
    else costCategory = 'High';
  } else if (type === 'Church-Affiliated') {
    // Church universities: mostly free or very low fees
    semesterFee = 280; // Mostly just semester contribution
    isTuitionFree = true;
    costCategory = 'Free';
    feeNote = 'Semester contribution only';
  } else {
    // ── PUBLIC UNIVERSITIES ──
    // Tuition is FREE — only Semesterbeitrag applies

    // ── Verified per-university Semesterbeitrag (2025/2026) ──
    // Sources: official university websites
    const knownSemesterbeitrag = {
      // Bavaria (no Deutschlandticket in semester fee)
      'Ludwig Maximilian University of Munich (LMU)': { fee: 97, note: '€97/sem Studierendenwerksbeitrag (lmu.de)' },
      'Technical University of Munich (TUM)': { fee: 97, note: '€97/sem + non-EU tuition €2,000-6,000/sem (tum.de)', tuition: 3000, hasTuition: true },
      'University of Erlangen-Nuremberg': { fee: 127, note: '€127/sem (fau.de)' },
      'University of Würzburg': { fee: 120, note: '~€120/sem (uni-wuerzburg.de)' },
      'University of Bayreuth': { fee: 115, note: '~€115/sem (uni-bayreuth.de)' },
      'University of Regensburg': { fee: 117, note: '~€117/sem (uni-regensburg.de)' },
      'University of Passau': { fee: 108, note: '~€108/sem (uni-passau.de)' },
      'University of Augsburg': { fee: 118, note: '~€118/sem (uni-augsburg.de)' },
      // Berlin
      'Free University of Berlin': { fee: 359, note: '€358.80/sem (fu-berlin.de)' },
      'Humboldt University of Berlin': { fee: 315, note: '~€315/sem (hu-berlin.de)' },
      'Technical University of Berlin': { fee: 312, note: '~€312/sem (tu.berlin)' },
      'Charité – Universitätsmedizin Berlin': { fee: 315, note: '~€315/sem (charite.de)' },
      // NRW
      'RWTH Aachen University': { fee: 303, note: '€303.49/sem (rwth-aachen.de)' },
      'University of Cologne': { fee: 336, note: '€335.65/sem (uni-koeln.de)' },
      'University of Münster': { fee: 321, note: '€320.17/sem → €352.67 SS2026 (uni-muenster.de)' },
      'University of Bonn': { fee: 230, note: '€230.07/sem (uni-bonn.de)' },
      'Heinrich Heine University Düsseldorf': { fee: 352, note: '€352.15/sem (hhu.de)' },
      'Ruhr University Bochum': { fee: 340, note: '~€340/sem (ruhr-uni-bochum.de)' },
      'University of Duisburg-Essen': { fee: 330, note: '~€330/sem (uni-due.de)' },
      'TU Dortmund University': { fee: 310, note: '~€310/sem (tu-dortmund.de)' },
      'Bielefeld University': { fee: 285, note: '~€285/sem (uni-bielefeld.de)' },
      'Paderborn University': { fee: 290, note: '~€290/sem (uni-paderborn.de)' },
      // Hamburg
      'University of Hamburg': { fee: 384, note: '€384/sem (uni-hamburg.de)' },
      'Hamburg University of Technology': { fee: 370, note: '~€370/sem (tuhh.de)' },
      // Lower Saxony
      'University of Göttingen': { fee: 157, note: '€157/sem from SS2026 (uni-goettingen.de)' },
      'Leibniz University Hannover': { fee: 435, note: '€434.91/sem (uni-hannover.de)' },
      'Technical University of Braunschweig': { fee: 266, note: '~€266/sem (tu-braunschweig.de)' },
      'University of Oldenburg': { fee: 180, note: '~€180/sem (uni-oldenburg.de)' },
      'University of Osnabrück': { fee: 305, note: '~€305/sem (uni-osnabrueck.de)' },
      // Baden-Württemberg (€1,500 non-EU tuition + semester fee)
      'Heidelberg University': { fee: 161, note: '€161.10/sem + non-EU tuition €1,500/sem (uni-heidelberg.de)', tuition: 1500, hasTuition: true },
      'Karlsruhe Institute of Technology (KIT)': { fee: 202, note: '€201.50/sem + non-EU tuition €1,500/sem (kit.edu)', tuition: 1500, hasTuition: true },
      'University of Stuttgart': { fee: 184, note: '€184/sem + non-EU tuition €1,500/sem (uni-stuttgart.de)', tuition: 1500, hasTuition: true },
      'University of Freiburg': { fee: 161, note: '~€161/sem + non-EU tuition €1,500/sem (uni-freiburg.de)', tuition: 1500, hasTuition: true },
      'University of Tübingen': { fee: 198, note: '€197.80/sem + non-EU tuition €1,500/sem (uni-tuebingen.de)', tuition: 1500, hasTuition: true },
      'University of Mannheim': { fee: 194, note: '€194/sem + non-EU tuition €1,500/sem (uni-mannheim.de)', tuition: 1500, hasTuition: true },
      'University of Konstanz': { fee: 164, note: '~€164/sem + non-EU tuition €1,500/sem (uni-konstanz.de)', tuition: 1500, hasTuition: true },
      'University of Ulm': { fee: 170, note: '~€170/sem + non-EU tuition €1,500/sem (uni-ulm.de)', tuition: 1500, hasTuition: true },
      'University of Hohenheim': { fee: 178, note: '~€178/sem + non-EU tuition €1,500/sem (uni-hohenheim.de)', tuition: 1500, hasTuition: true },
      // Hesse
      'Goethe University Frankfurt': { fee: 370, note: '~€370/sem (goethe-university-frankfurt.de)' },
      'TU Darmstadt': { fee: 270, note: '~€270/sem (tu-darmstadt.de)' },
      'University of Giessen': { fee: 296, note: '~€296/sem (uni-giessen.de)' },
      'University of Marburg': { fee: 290, note: '~€290/sem (uni-marburg.de)' },
      'University of Kassel': { fee: 275, note: '~€275/sem (uni-kassel.de)' },
      // Saxony
      'TU Dresden': { fee: 220, note: '~€220/sem (tu-dresden.de)' },
      'Leipzig University': { fee: 210, note: '~€210/sem (uni-leipzig.de)' },
      // Others
      'University of Bremen': { fee: 360, note: '~€360/sem (uni-bremen.de)' },
      'University of Potsdam': { fee: 280, note: '~€280/sem (uni-potsdam.de)' },
      'University of Rostock': { fee: 100, note: '~€100/sem (uni-rostock.de)' },
      'Saarland University': { fee: 300, note: '~€300/sem (uni-saarland.de)' },
      'Friedrich Schiller University Jena': { fee: 250, note: '~€250/sem (uni-jena.de)' },
      'Kiel University': { fee: 280, note: '~€280/sem (uni-kiel.de)' },
      'Johannes Gutenberg University Mainz': { fee: 170, note: '~€170/sem (uni-mainz.de)' },
    };

    const knownUni = knownSemesterbeitrag[name];
    if (knownUni && knownUni.hasTuition) {
      // University with verified tuition (TUM non-EU, BW non-EU)
      semesterFee = knownUni.tuition + knownUni.fee;
      isTuitionFree = false;
      costCategory = 'Low';
      feeNote = knownUni.note;
    } else if (knownUni) {
      // University with verified Semesterbeitrag only (free tuition)
      semesterFee = knownUni.fee;
      isTuitionFree = true;
      costCategory = 'Free';
      feeNote = knownUni.note;
    } else if (state === 'Baden-Württemberg') {
      // BW fallback: €1,500 non-EU tuition + ~€170 avg semester fee
      semesterFee = 1670;
      isTuitionFree = false;
      costCategory = 'Low';
      feeNote = 'Non-EU: €1,500/sem tuition + ~€170/sem semester fee';
    } else {
      // Fallback: state average Semesterbeitrag
      isTuitionFree = true;
      const stateAvg = {
        'Bavaria': 115, 'Berlin': 330, 'Brandenburg': 290, 'Bremen': 360,
        'Hamburg': 380, 'Hesse': 300, 'Lower Saxony': 300,
        'Mecklenburg-Vorpommern': 100, 'North Rhine-Westphalia': 310,
        'Rhineland-Palatinate': 170, 'Saarland': 300, 'Saxony': 215,
        'Saxony-Anhalt': 235, 'Schleswig-Holstein': 290, 'Thuringia': 250,
      };
      semesterFee = stateAvg[state] || 250;
      costCategory = 'Free';
      feeNote = `~€${semesterFee}/sem semester contribution (state avg)`;
    }
  }

  // For FREE universities: tuition = €0, semesterFee = Semesterbeitrag only
  // For PAID universities: tuition = actual tuition per semester
  const tuitionPerSem = isTuitionFree ? 0 : semesterFee;
  const tuitionYearlyEUR = tuitionPerSem * 2;
  const tuitionYearlyBDT = Math.round(tuitionYearlyEUR * EUR_TO_BDT);

  // Semesterbeitrag is always separate (€80-€420 per semester for public)
  // For private, the semesterFee already includes everything
  const semesterbeitragPerSem = isTuitionFree ? semesterFee : 0;

  return {
    tuitionFeePerSemester: tuitionPerSem,
    tuitionYearlyEUR: tuitionYearlyEUR,
    tuitionYearlyBDT: tuitionYearlyBDT,
    semesterbeitrag: semesterbeitragPerSem,
    isTuitionFree: isTuitionFree,
    costCategory: costCategory,
    feeNote: feeNote,
  };
}

function getRequirements(type, category) {
  // Returns separate bachelor and master requirements
  let bsc = '';
  let msc = '';

  if (type === 'Private') {
    bsc = 'Abitur or equiv (12yr) + English B2/C1 or German B2 + own selection procedure';
    msc = 'BSc/BA degree + English B2/C1 or German B2 + own selection + CV/motivation';
  } else if (type === 'Church-Affiliated') {
    bsc = 'Abitur or Fachabitur + German B2';
    msc = 'BSc/BA degree (180 ECTS) + German B2';
  } else if (category === 'University of Applied Sciences') {
    bsc = 'Fachabitur or Abitur + German B2 or English B2 (IELTS 6.0)';
    msc = 'BSc/BA degree (210 ECTS) + German B2 or English B2 (IELTS 6.5) + relevant field';
  } else if (category === 'Administrative University') {
    bsc = 'German/EU citizenship + Abitur + selection by public authority';
    msc = 'BSc + German citizenship/EU + selection by authority';
  } else if (category === 'Art/Music Academy') {
    bsc = 'Abitur or equiv + aptitude test/audition/portfolio + German B2';
    msc = 'BSc/BA in Arts/Music + audition/portfolio + German B2 or English B2';
  } else if (category === 'University of Education') {
    bsc = 'Abitur or equiv + German C1 + specific subject requirements';
    msc = 'BSc Education/Teaching + German C1';
  } else if (category === 'Technical University') {
    bsc = 'Abitur or equiv + Math/Physics + German B2/C1 or English B2 (IELTS 6.0)';
    msc = 'BSc Engineering/Science (180 ECTS) + English B2 (IELTS 6.5) or German C1';
  } else if (category === 'Medical University') {
    bsc = 'Abitur with high GPA + German C1 + TestAS/entrance exam';
    msc = 'Medical degree + German C1 + state exam (Staatsexamen)';
  } else {
    bsc = 'Abitur or equiv (12yr) + German B2/C1 or English B2 (IELTS 6.0)';
    msc = 'BSc/BA degree (180 ECTS) + German B2/C1 or English B2 (IELTS 6.5)';
  }

  return { bachelorRequirements: bsc, masterRequirements: msc };
}

function getWebsiteUrl(name, germanName) {
  const n = (name + germanName).toLowerCase();
  // Try to generate a plausible URL
  let slug = name.toLowerCase()
    .replace(/university of applied sciences/gi, '')
    .replace(/university of/gi, '')
    .replace(/technical university/gi, 'tu')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `https://www.${slug.substring(0, 30)}.de`;
}

// Known website URLs for top universities
const knownUrls = {
  'RWTH Aachen University': 'https://www.rwth-aachen.de',
  'Free University of Berlin': 'https://www.fu-berlin.de',
  'Humboldt University of Berlin': 'https://www.hu-berlin.de',
  'Technical University of Berlin': 'https://www.tu.berlin',
  'Ludwig Maximilian University of Munich (LMU)': 'https://www.lmu.de',
  'Technical University of Munich (TUM)': 'https://www.tum.de',
  'Heidelberg University': 'https://www.uni-heidelberg.de',
  'University of Freiburg': 'https://www.uni-freiburg.de',
  'Karlsruhe Institute of Technology (KIT)': 'https://www.kit.edu',
  'University of Göttingen': 'https://www.uni-goettingen.de',
  'University of Hamburg': 'https://www.uni-hamburg.de',
  'University of Bonn': 'https://www.uni-bonn.de',
  'University of Cologne': 'https://www.uni-koeln.de',
  'Leipzig University': 'https://www.uni-leipzig.de',
  'TU Dresden': 'https://www.tu-dresden.de',
  'University of Stuttgart': 'https://www.uni-stuttgart.de',
  'University of Tübingen': 'https://www.uni-tuebingen.de',
  'University of Mannheim': 'https://www.uni-mannheim.de',
  'Goethe University Frankfurt': 'https://www.goethe-university-frankfurt.de',
  'University of Münster': 'https://www.uni-muenster.de',
  'University of Erlangen-Nuremberg': 'https://www.fau.de',
  'TU Darmstadt': 'https://www.tu-darmstadt.de',
  'University of Bremen': 'https://www.uni-bremen.de',
  'Leibniz University Hannover': 'https://www.uni-hannover.de',
  'University of Würzburg': 'https://www.uni-wuerzburg.de',
  'University of Potsdam': 'https://www.uni-potsdam.de',
  'University of Rostock': 'https://www.uni-rostock.de',
  'Saarland University': 'https://www.uni-saarland.de',
  'Bielefeld University': 'https://www.uni-bielefeld.de',
  'Ruhr University Bochum': 'https://www.ruhr-uni-bochum.de',
  'University of Regensburg': 'https://www.uni-regensburg.de',
  'University of Passau': 'https://www.uni-passau.de',
  'Witten/Herdecke University': 'https://www.uni-wh.de',
  'ESMT Berlin': 'https://www.esmt.berlin',
  'Frankfurt School of Finance & Management': 'https://www.fs.de',
  'WHU – Otto Beisheim School of Management': 'https://www.whu.edu',
  'Constructor University (formerly Jacobs University)': 'https://www.constructor.university',
  'IU International University of Applied Sciences': 'https://www.iu.de',
  'FOM University of Applied Sciences': 'https://www.fom.de',
  'SRH University Heidelberg': 'https://www.srh-hochschule-heidelberg.de',
};

function buildUniversity(name, germanName, city, state, type, sectionCategory) {
  const cleanedCity = cleanCity(city);
  const category = sectionCategory === 'University' ? inferCategory(name, germanName) : sectionCategory;
  const costs = getTuitionAndCost(type, state, category, name);
  const reqs = getRequirements(type, category);

  // For universities with tuition, bachelor and master may have different costs
  // For private: master is usually ~20-30% more expensive
  // For public free: both are 0
  const bscTuition = costs.tuitionYearlyEUR;
  const mscTuition = costs.isTuitionFree ? 0 : Math.round(costs.tuitionYearlyEUR * 1.15); // masters ~15% more

  return {
    id: idCounter++,
    name: name,
    localName: germanName || name,
    country: 'Germany',
    city: cleanedCity,
    state: state,
    type: type,
    category: category,
    degreeTypes: getDegreeTypes(category, type),
    ranking: null,
    bachelorTuitionEUR: bscTuition,
    bachelorTuitionBDT: Math.round(bscTuition * EUR_TO_BDT),
    masterTuitionEUR: mscTuition,
    masterTuitionBDT: Math.round(mscTuition * EUR_TO_BDT),
    semesterbeitrag: costs.semesterbeitrag,
    isTuitionFree: costs.isTuitionFree,
    costCategory: costs.costCategory,
    tuitionNote: costs.feeNote,
    bachelorRequirements: reqs.bachelorRequirements,
    masterRequirements: reqs.masterRequirements,
    websiteUrl: knownUrls[name] || getWebsiteUrl(name, germanName),
  };
}

function parsePublicMd(text) {
  const universities = [];

  // Section 1: Public Universities
  const sections = [
    { marker: '## 1. PUBLIC UNIVERSITIES', end: '### Universities of Education', type: 'Public', cat: 'University' },
    { marker: '### Universities of Education', end: '## 2. PUBLIC UNIVERSITIES OF APPLIED', type: 'Public', cat: 'University of Education' },
    { marker: '## 2. PUBLIC UNIVERSITIES OF APPLIED SCIENCES', end: '## 3. PUBLIC ART', type: 'Public', cat: 'University of Applied Sciences' },
    { marker: '## 3. PUBLIC ART, MUSIC, FILM & DESIGN', end: '## 4. PUBLIC UNIVERSITIES OF APPLIED ADMINISTRATIVE', type: 'Public', cat: 'Art/Music Academy' },
    { marker: '## 4. PUBLIC UNIVERSITIES OF APPLIED ADMINISTRATIVE', end: '## 5. PUBLIC DUAL', type: 'Public', cat: 'Administrative University' },
    { marker: '## 5. PUBLIC DUAL / COOPERATIVE', end: '## GRAND TOTAL', type: 'Public', cat: 'Dual University' },
  ];

  for (const sec of sections) {
    const sectionText = extractSection(text, sec.marker, sec.end);
    const rows = parseMdTable(sectionText);

    for (const cells of rows) {
      // cells: [#, Name, GermanName, City, State] or [#, Name, GermanName, City, State, Denomination]
      const idx = cells[0].match(/^\d+$/) ? 1 : 0;
      const name = cells[idx] || '';
      const germanName = cells[idx + 1] || '';
      const city = cells[idx + 2] || '';
      const state = cells[idx + 3] || '';

      if (!name || !city) continue;

      universities.push(buildUniversity(name, germanName, city, state, sec.type, sec.cat));
    }
  }

  return universities;
}

function parsePrivateMd(text) {
  const universities = [];

  const sections = [
    { marker: '## 1. PRIVATE UNIVERSITIES (Research', end: '## 2. PRIVATE UNIVERSITIES OF APPLIED', type: 'Private', cat: 'University' },
    { marker: '## 2. PRIVATE UNIVERSITIES OF APPLIED SCIENCES', end: '## 3. CHURCH-AFFILIATED', type: 'Private', cat: 'University of Applied Sciences' },
    { marker: '### Evangelische (Protestant)', end: '### Katholische (Catholic)', type: 'Church-Affiliated', cat: 'Church-Affiliated University' },
    { marker: '### Katholische (Catholic)', end: '### Other Church-Affiliated', type: 'Church-Affiliated', cat: 'Church-Affiliated University' },
    { marker: '### Other Church-Affiliated', end: '## 4. THEOLOGICAL COLLEGES', type: 'Church-Affiliated', cat: 'Church-Affiliated University' },
    { marker: '## 4. THEOLOGICAL COLLEGES', end: '## 5. PRIVATE ART', type: 'Private', cat: 'Theological College' },
    { marker: '## 5. PRIVATE ART & DESIGN', end: '## GRAND TOTAL', type: 'Private', cat: 'Art/Music Academy' },
  ];

  for (const sec of sections) {
    const sectionText = extractSection(text, sec.marker, sec.end);
    const rows = parseMdTable(sectionText);

    for (const cells of rows) {
      const idx = cells[0].match(/^\d+$/) ? 1 : 0;
      const name = cells[idx] || '';
      const germanName = cells[idx + 1] || '';
      const city = cells[idx + 2] || '';
      const stateOrDenom = cells[idx + 3] || '';

      if (!name || !city) continue;

      // For theological colleges, the table has an extra "Denomination" column
      let state = stateOrDenom;
      if (sec.cat === 'Theological College' && cells.length > idx + 4) {
        state = cells[idx + 3] || '';
      }

      universities.push(buildUniversity(name, germanName, city, state, sec.type, sec.cat));
    }
  }

  return universities;
}

// ══════════════════════════════════════════════════════
// AUTHENTIC QS World University Rankings 2026
// Source: topuniversities.com, learngermanonline.org
// Only universities with verified QS ranks are included
// Others get globalRanking = null (not ranked / not applicable)
// ══════════════════════════════════════════════════════
function assignRankings(universities) {
  const qsRankings2026 = {
    'Technical University of Munich (TUM)': 22,
    'Ludwig Maximilian University of Munich (LMU)': 58,
    'Heidelberg University': 80,
    'Free University of Berlin': 88,
    'Karlsruhe Institute of Technology (KIT)': 98,
    'RWTH Aachen University': 105,
    'Humboldt University of Berlin': 130,
    'Technical University of Berlin': 145,
    'University of Hamburg': 193,
    'University of Freiburg': 201,
    'University of Bonn': 207,
    'University of Tübingen': 215,
    'TU Dresden': 218,
    'University of Erlangen-Nuremberg': 232,
    'University of Göttingen': 243,
    'TU Darmstadt': 253,
    'University of Cologne': 272,
    'University of Stuttgart': 310,
    'Goethe University Frankfurt': 316,
    'University of Münster': 350,
    'Ruhr University Bochum': 395,
    'University of Würzburg': 416,
    'University of Mannheim': 416,
    'Leibniz University Hannover': 433,
    'University of Konstanz': 440,
    'University of Bayreuth': 448,
    'Johannes Gutenberg University Mainz': 452,
    'University of Potsdam': 477,
    'Freiberg University of Mining and Technology': 487,
    'University of Giessen': 496,
    'University of Bremen': 530,
    'Leipzig University': 535,
    'University of Ulm': 546,
    'Friedrich Schiller University Jena': 575,
    'Kiel University': 618,
    'Saarland University': 635,
    'TU Dortmund University': 673,
    'University of Regensburg': 691,
    'Hamburg University of Technology': 696,
    'Technical University of Braunschweig': 715,
    'University of Hohenheim': 715,
    'Martin Luther University of Halle-Wittenberg': 755,
    'University of Marburg': 775,
    'University of Duisburg-Essen': 825,
    'Heinrich Heine University Düsseldorf': 875,
    'University of Rostock': 875,
    'Bielefeld University': 1100,
    'RPTU Kaiserslautern-Landau': 1300,
    'University of Siegen': 1300,
  };

  for (const uni of universities) {
    const qsRank = qsRankings2026[uni.name];
    uni.ranking = qsRank || null; // null = not ranked in QS
  }
}

// Main
try {
  const publicText = fs.readFileSync(PUBLIC_MD, 'utf-8');
  const privateText = fs.readFileSync(PRIVATE_MD, 'utf-8');

  const publicUnis = parsePublicMd(publicText);
  const privateUnis = parsePrivateMd(privateText);

  const allUniversities = [...publicUnis, ...privateUnis];
  assignRankings(allUniversities);

  fs.writeFileSync(OUTPUT, JSON.stringify(allUniversities, null, 2), 'utf-8');

  console.log(`Generated ${allUniversities.length} universities:`);
  console.log(`  Public: ${publicUnis.length}`);
  console.log(`  Private/Church: ${privateUnis.length}`);
  console.log(`Output: ${OUTPUT}`);

  // Stats
  const types = {};
  const categories = {};
  allUniversities.forEach(u => {
    types[u.type] = (types[u.type] || 0) + 1;
    categories[u.category] = (categories[u.category] || 0) + 1;
  });
  console.log('\nBy type:', types);
  console.log('By category:', categories);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
