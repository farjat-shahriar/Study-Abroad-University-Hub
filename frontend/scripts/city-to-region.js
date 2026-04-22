/**
 * City → Region mappings for Italy and Spain
 * Used by JSON generators to fill in state/region fields
 */

// Italy: City → Region
const ITALY_REGIONS = {
  // Lombardia
  'Milan': 'Lombardy', 'Milano': 'Lombardy', 'Bergamo': 'Lombardy', 'Brescia': 'Lombardy',
  'Pavia': 'Lombardy', 'Varese': 'Lombardy', 'Como': 'Lombardy', 'Castellanza': 'Lombardy',
  // Lazio
  'Rome': 'Lazio', 'Roma': 'Lazio', 'Cassino': 'Lazio', 'Viterbo': 'Lazio',
  // Veneto
  'Padua': 'Veneto', 'Padova': 'Veneto', 'Venice': 'Veneto', 'Venezia': 'Veneto',
  'Verona': 'Veneto',
  // Emilia-Romagna
  'Bologna': 'Emilia-Romagna', 'Parma': 'Emilia-Romagna', 'Modena': 'Emilia-Romagna',
  'Ferrara': 'Emilia-Romagna', 'Reggio Emilia': 'Emilia-Romagna', 'Bra': 'Piedmont',
  // Piedmont
  'Turin': 'Piedmont', 'Torino': 'Piedmont', 'Vercelli': 'Piedmont', 'Novara': 'Piedmont',
  // Tuscany
  'Florence': 'Tuscany', 'Firenze': 'Tuscany', 'Pisa': 'Tuscany', 'Siena': 'Tuscany',
  'Lucca': 'Tuscany', 'Camerino': 'Marche',
  // Campania
  'Naples': 'Campania', 'Napoli': 'Campania', 'Caserta': 'Campania', 'Salerno': 'Campania',
  'Benevento': 'Campania',
  // Liguria
  'Genoa': 'Liguria', 'Genova': 'Liguria',
  // Sicily
  'Catania': 'Sicily', 'Palermo': 'Sicily', 'Messina': 'Sicily', 'Enna': 'Sicily',
  // Puglia
  'Bari': 'Puglia', 'Lecce': 'Puglia', 'Foggia': 'Puglia',
  // Sardinia
  'Cagliari': 'Sardinia', 'Sassari': 'Sardinia',
  // Calabria
  'Catanzaro': 'Calabria', 'Rende': 'Calabria', 'Reggio Calabria': 'Calabria',
  // Marche
  'Ancona': 'Marche', 'Macerata': 'Marche', 'Urbino': 'Marche',
  // Abruzzo
  'L\'Aquila': 'Abruzzo', "L'Aquila": 'Abruzzo', 'Chieti': 'Abruzzo', 'Pescara': 'Abruzzo',
  'Teramo': 'Abruzzo',
  // Friuli Venezia Giulia
  'Trieste': 'Friuli Venezia Giulia', 'Udine': 'Friuli Venezia Giulia',
  // Trentino-Alto Adige
  'Trento': 'Trentino-Alto Adige', 'Bolzano': 'Trentino-Alto Adige',
  // Umbria
  'Perugia': 'Umbria',
  // Basilicata
  'Potenza': 'Basilicata',
  // Molise
  'Campobasso': 'Molise',
  // Valle d'Aosta
  'Aosta': "Valle d'Aosta",
  // Multi-campus / Others
  'Novedrate': 'Lombardy', 'Msida': 'Malta',
  'Maisons-Alfort': 'Île-de-France',
  'Vercelli': 'Piedmont', 'Novara': 'Piedmont',
  'Sèvres': 'Île-de-France',
  // Torrevecchia Teatina
  'Torrevecchia Teatina': 'Abruzzo',
};

// Spain: City → Autonomous Community
const SPAIN_REGIONS = {
  // Madrid
  'Madrid': 'Community of Madrid', 'Getafe': 'Community of Madrid', 'Móstoles': 'Community of Madrid',
  'Alcalá de Henares': 'Community of Madrid', 'Collado Villalba': 'Community of Madrid',
  'Villanueva de la Cañada': 'Community of Madrid', 'Villaviciosa de Odón': 'Community of Madrid',
  'Pozuelo de Alarcón': 'Community of Madrid', 'Hoyo de Manzanares': 'Community of Madrid',
  // Cataluña
  'Barcelona': 'Catalonia', 'Cerdanyola del Vallès': 'Catalonia', 'Vic': 'Catalonia',
  'Tarragona': 'Catalonia', 'Girona': 'Catalonia', 'Lleida': 'Catalonia',
  // Andalucía
  'Seville': 'Andalusia', 'Granada': 'Andalusia', 'Málaga': 'Andalusia', 'Córdoba': 'Andalusia',
  'Cádiz': 'Andalusia', 'Jaén': 'Andalusia', 'Almería': 'Andalusia', 'Huelva': 'Andalusia',
  'Marbella': 'Andalusia', 'Estepona': 'Andalusia',
  // Valencia
  'Valencia': 'Valencian Community', 'Alicante': 'Valencian Community',
  'San Vicente del Raspeig': 'Valencian Community', 'Elche': 'Valencian Community',
  'Castellón de la Plana': 'Valencian Community', 'Moncada': 'Valencian Community',
  'Castellón': 'Valencian Community',
  // Basque Country
  'Leioa': 'Basque Country', 'Bilbao': 'Basque Country', 'Mondragón': 'Basque Country',
  'San Sebastián': 'Basque Country', 'Vitoria-Gasteiz': 'Basque Country',
  // Galicia
  'Santiago de Compostela': 'Galicia', 'Santiago': 'Galicia',
  'A Coruña': 'Galicia', 'Vigo': 'Galicia',
  // Castilla y León
  'Salamanca': 'Castile and León', 'Valladolid': 'Castile and León',
  'Burgos': 'Castile and León', 'León': 'Castile and León',
  'Segovia': 'Castile and León', 'Ávila': 'Castile and León',
  // Others
  'Pamplona': 'Navarre', 'Zaragoza': 'Aragon', 'Oviedo': 'Asturias',
  'Santander': 'Cantabria', 'Ciudad Real': 'Castile-La Mancha',
  'Badajoz': 'Extremadura', 'Palma': 'Balearic Islands',
  'Murcia': 'Region of Murcia', 'Cartagena': 'Region of Murcia',
  'Logroño': 'La Rioja', 'San Cristóbal de La Laguna': 'Canary Islands',
  'San Cristóbal': 'Canary Islands', 'Las Palmas de Gran Canaria': 'Canary Islands',
  'Las Palmas': 'Canary Islands', 'La Orotava': 'Canary Islands',
  'Santa María de Guía': 'Canary Islands',
  'Villanueva de Gállego': 'Aragon',
  'Odense': 'Denmark',
};

module.exports = { ITALY_REGIONS, SPAIN_REGIONS };
