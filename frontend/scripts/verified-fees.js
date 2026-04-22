/**
 * Verified per-university tuition fees (Non-EU, per year, EUR)
 * Sources: Official university websites, verified April 2026
 * Used by all country JSON generators
 */

const ITALY_VERIFIED = {
  'Politecnico di Milano': { bsc: 3898, msc: 3898, note: '€3,898/yr flat for non-EU (polimi.it)' },
  'Sapienza University of Rome': { bsc: 2900, msc: 2900, note: 'Max €2,900/yr; ISEE can reduce to €156 (uniroma1.it)' },
  'University of Bologna (UNIBO)': { bsc: 2900, msc: 2900, note: 'Max ~€3,000/yr; ISEE can reduce to €157 (unibo.it)' },
  'University of Padua (UNIPD)': { bsc: 2900, msc: 2900, note: 'Max €2,900/yr; ISEE can reduce to €186 (unipd.it)' },
  'University of Pisa': { bsc: 2900, msc: 2900, note: '€2,900 flat for non-EU with country coefficient (unipi.it)' },
  'University of Milan (UniMi)': { bsc: 3500, msc: 3500, note: 'Max ~€3,500/yr; ISEE can reduce (unimi.it)' },
  'Polytechnic University of Turin (PoliTo)': { bsc: 3500, msc: 3500, note: '~€3,500/yr for non-EU (polito.it)' },
  'University of Florence (UniFi)': { bsc: 2900, msc: 2900, note: 'Max €2,900/yr; ISEE can reduce (unifi.it)' },
  'University of Turin (UniTo)': { bsc: 3200, msc: 3200, note: 'Max ~€3,200/yr; ISEE can reduce (unito.it)' },
  'University of Naples Federico II': { bsc: 2500, msc: 2500, note: 'Max ~€2,500/yr (unina.it)' },
  'University of Rome Tor Vergata': { bsc: 2900, msc: 2900, note: 'Max €2,900/yr (uniroma2.it)' },
  'University of Genoa': { bsc: 3000, msc: 3000, note: 'Max ~€3,000/yr (unige.it)' },
  'University of Pavia': { bsc: 4500, msc: 4500, note: '€400-€4,500/yr range (unipv.it)' },
  'University of Milan-Bicocca': { bsc: 3500, msc: 3500, note: 'Max ~€3,500/yr (unimib.it)' },
  'University of Trento': { bsc: 3000, msc: 3000, note: 'Max ~€3,000/yr (unitn.it)' },
  'University of Camerino (UNICAM)': { bsc: 556, msc: 556, note: '€556/yr FLAT for ALL students (unicam.it)' },
  'Bocconi University': { bsc: 13000, msc: 15000, note: 'Private: €12K-14K BSc, €14K-16K MSc (unibocconi.eu)' },
  'Università Cattolica del Sacro Cuore': { bsc: 7000, msc: 8500, note: 'Private Catholic: €5K-9K BSc, €6K-11K MSc (unicatt.it)' },
  'Vita-Salute San Raffaele University': { bsc: 11500, msc: 14000, note: 'Private Medical: €8K-15K BSc, €10K-18K MSc (unisr.it)' },
  'LUISS University': { bsc: 11000, msc: 13000, note: 'Private: €8K-14K BSc, €10K-16K MSc (luiss.it)' },
  'Humanitas University': { bsc: 15000, msc: 15000, note: 'Private Medical: €12K-18K (hunimed.eu)' },
  'UniCamillus University': { bsc: 12000, msc: 12000, note: 'Private Medical: €8K-16K (unicamillus.org)' },
};

module.exports = { ITALY_VERIFIED };
