// ============================================================
// FIFA World Cup 2026 — Complete 48-Team Dataset
// with Country → Cuisine Mappings
// ============================================================

export interface TeamData {
  id: string;
  name: string;
  country: string; // ISO 3166-1 alpha-2
  confederation: string;
  cuisineTags: string[];
  flagEmoji: string;
  signatureDishes: string[]; // 3 iconic dishes for menu generation inspiration
}

export const teams: TeamData[] = [
  // --- CONMEBOL (South America) ---
  { id: 'team-br', name: 'Brazil', country: 'BR', confederation: 'CONMEBOL', cuisineTags: ['brazilian', 'south-american', 'tropical'], flagEmoji: '🇧🇷', signatureDishes: ['Feijoada', 'Coxinha', 'Pão de Queijo'] },
  { id: 'team-ar', name: 'Argentina', country: 'AR', confederation: 'CONMEBOL', cuisineTags: ['argentinian', 'asado', 'south-american'], flagEmoji: '🇦🇷', signatureDishes: ['Asado', 'Empanadas', 'Dulce de Leche'] },
  { id: 'team-uy', name: 'Uruguay', country: 'UY', confederation: 'CONMEBOL', cuisineTags: ['uruguayan', 'south-american', 'grilled'], flagEmoji: '🇺🇾', signatureDishes: ['Chivito', 'Milanesa', 'Dulce de Leche Pancakes'] },
  { id: 'team-co', name: 'Colombia', country: 'CO', confederation: 'CONMEBOL', cuisineTags: ['colombian', 'south-american', 'tropical'], flagEmoji: '🇨🇴', signatureDishes: ['Bandeja Paisa', 'Arepas', 'Sancocho'] },
  { id: 'team-ec', name: 'Ecuador', country: 'EC', confederation: 'CONMEBOL', cuisineTags: ['ecuadorian', 'south-american', 'andean'], flagEmoji: '🇪🇨', signatureDishes: ['Ceviche', 'Llapingachos', 'Encebollado'] },
  { id: 'team-pe', name: 'Peru', country: 'PE', confederation: 'CONMEBOL', cuisineTags: ['peruvian', 'south-american', 'ceviche'], flagEmoji: '🇵🇪', signatureDishes: ['Ceviche', 'Lomo Saltado', 'Aji de Gallina'] },

  // --- UEFA (Europe) ---
  { id: 'team-de', name: 'Germany', country: 'DE', confederation: 'UEFA', cuisineTags: ['german', 'central-european', 'hearty'], flagEmoji: '🇩🇪', signatureDishes: ['Bratwurst', 'Schnitzel', 'Black Forest Cake'] },
  { id: 'team-es', name: 'Spain', country: 'ES', confederation: 'UEFA', cuisineTags: ['spanish', 'mediterranean', 'tapas'], flagEmoji: '🇪🇸', signatureDishes: ['Paella', 'Patatas Bravas', 'Churros con Chocolate'] },
  { id: 'team-fr', name: 'France', country: 'FR', confederation: 'UEFA', cuisineTags: ['french', 'patisserie', 'fine-dining'], flagEmoji: '🇫🇷', signatureDishes: ['Coq au Vin', 'Croissants', 'Crème Brûlée'] },
  { id: 'team-it', name: 'Italy', country: 'IT', confederation: 'UEFA', cuisineTags: ['italian', 'mediterranean', 'pasta'], flagEmoji: '🇮🇹', signatureDishes: ['Risotto alla Milanese', 'Ossobuco', 'Tiramisu'] },
  { id: 'team-gb', name: 'England', country: 'GB', confederation: 'UEFA', cuisineTags: ['british', 'pub-food', 'comfort'], flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', signatureDishes: ['Fish and Chips', 'Beef Wellington', 'Sticky Toffee Pudding'] },
  { id: 'team-pt', name: 'Portugal', country: 'PT', confederation: 'UEFA', cuisineTags: ['portuguese', 'mediterranean', 'seafood'], flagEmoji: '🇵🇹', signatureDishes: ['Bacalhau', 'Pastel de Nata', 'Francesinha'] },
  { id: 'team-nl', name: 'Netherlands', country: 'NL', confederation: 'UEFA', cuisineTags: ['dutch', 'northern-european', 'comfort'], flagEmoji: '🇳🇱', signatureDishes: ['Stroopwafels', 'Bitterballen', 'Stamppot'] },
  { id: 'team-be', name: 'Belgium', country: 'BE', confederation: 'UEFA', cuisineTags: ['belgian', 'chocolate', 'frites'], flagEmoji: '🇧🇪', signatureDishes: ['Moules-Frites', 'Belgian Waffles', 'Chocolate Truffles'] },
  { id: 'team-hr', name: 'Croatia', country: 'HR', confederation: 'UEFA', cuisineTags: ['croatian', 'balkan', 'mediterranean'], flagEmoji: '🇭🇷', signatureDishes: ['Ćevapi', 'Black Risotto', 'Štrukli'] },
  { id: 'team-rs', name: 'Serbia', country: 'RS', confederation: 'UEFA', cuisineTags: ['serbian', 'balkan', 'grilled'], flagEmoji: '🇷🇸', signatureDishes: ['Pljeskavica', 'Ćevapi', 'Kajmak'] },
  { id: 'team-ch', name: 'Switzerland', country: 'CH', confederation: 'UEFA', cuisineTags: ['swiss', 'alpine', 'cheese'], flagEmoji: '🇨🇭', signatureDishes: ['Fondue', 'Raclette', 'Rösti'] },
  { id: 'team-dk', name: 'Denmark', country: 'DK', confederation: 'UEFA', cuisineTags: ['danish', 'nordic', 'new-nordic'], flagEmoji: '🇩🇰', signatureDishes: ['Smørrebrød', 'Danish Pastries', 'Frikadeller'] },
  { id: 'team-pl', name: 'Poland', country: 'PL', confederation: 'UEFA', cuisineTags: ['polish', 'eastern-european', 'hearty'], flagEmoji: '🇵🇱', signatureDishes: ['Pierogi', 'Bigos', 'Żurek'] },
  { id: 'team-ua', name: 'Ukraine', country: 'UA', confederation: 'UEFA', cuisineTags: ['ukrainian', 'eastern-european', 'comfort'], flagEmoji: '🇺🇦', signatureDishes: ['Borscht', 'Varenyky', 'Chicken Kyiv'] },
  { id: 'team-at', name: 'Austria', country: 'AT', confederation: 'UEFA', cuisineTags: ['austrian', 'alpine', 'pastry'], flagEmoji: '🇦🇹', signatureDishes: ['Wiener Schnitzel', 'Sachertorte', 'Apfelstrudel'] },
  { id: 'team-tr', name: 'Turkey', country: 'TR', confederation: 'UEFA', cuisineTags: ['turkish', 'middle-eastern', 'kebab'], flagEmoji: '🇹🇷', signatureDishes: ['Kebab', 'Baklava', 'Lahmacun'] },

  // --- CONCACAF (North/Central America & Caribbean) ---
  { id: 'team-us', name: 'United States', country: 'US', confederation: 'CONCACAF', cuisineTags: ['american', 'bbq', 'fusion', 'diner'], flagEmoji: '🇺🇸', signatureDishes: ['Smoked Brisket', 'Loaded Burger', 'New York Cheesecake'] },
  { id: 'team-mx', name: 'Mexico', country: 'MX', confederation: 'CONCACAF', cuisineTags: ['mexican', 'latin-american', 'street-food'], flagEmoji: '🇲🇽', signatureDishes: ['Tacos al Pastor', 'Mole Poblano', 'Churros'] },
  { id: 'team-ca', name: 'Canada', country: 'CA', confederation: 'CONCACAF', cuisineTags: ['canadian', 'north-american', 'maple'], flagEmoji: '🇨🇦', signatureDishes: ['Poutine', 'Maple Glazed Salmon', 'Butter Tarts'] },
  { id: 'team-jm', name: 'Jamaica', country: 'JM', confederation: 'CONCACAF', cuisineTags: ['jamaican', 'caribbean', 'jerk'], flagEmoji: '🇯🇲', signatureDishes: ['Jerk Chicken', 'Ackee and Saltfish', 'Rum Cake'] },
  { id: 'team-cr', name: 'Costa Rica', country: 'CR', confederation: 'CONCACAF', cuisineTags: ['costa-rican', 'central-american', 'tropical'], flagEmoji: '🇨🇷', signatureDishes: ['Gallo Pinto', 'Casado', 'Tres Leches Cake'] },

  // --- AFC (Asia) ---
  { id: 'team-jp', name: 'Japan', country: 'JP', confederation: 'AFC', cuisineTags: ['japanese', 'asian', 'sushi', 'ramen'], flagEmoji: '🇯🇵', signatureDishes: ['Ramen', 'Sushi', 'Katsu Curry'] },
  { id: 'team-kr', name: 'South Korea', country: 'KR', confederation: 'AFC', cuisineTags: ['korean', 'asian', 'fermented', 'bbq'], flagEmoji: '🇰🇷', signatureDishes: ['Bibimbap', 'Korean Fried Chicken', 'Kimchi Jjigae'] },
  { id: 'team-au', name: 'Australia', country: 'AU', confederation: 'AFC', cuisineTags: ['australian', 'pacific-rim', 'bbq'], flagEmoji: '🇦🇺', signatureDishes: ['Meat Pie', 'Barramundi', 'Lamingtons'] },
  { id: 'team-sa', name: 'Saudi Arabia', country: 'SA', confederation: 'AFC', cuisineTags: ['saudi', 'middle-eastern', 'arabic'], flagEmoji: '🇸🇦', signatureDishes: ['Kabsa', 'Shawarma', 'Kunafa'] },
  { id: 'team-ir', name: 'Iran', country: 'IR', confederation: 'AFC', cuisineTags: ['persian', 'middle-eastern', 'saffron'], flagEmoji: '🇮🇷', signatureDishes: ['Tahdig', 'Ghormeh Sabzi', 'Saffron Ice Cream'] },
  { id: 'team-qa', name: 'Qatar', country: 'QA', confederation: 'AFC', cuisineTags: ['qatari', 'middle-eastern', 'gulf'], flagEmoji: '🇶🇦', signatureDishes: ['Machboos', 'Luqaimat', 'Harees'] },
  { id: 'team-uz', name: 'Uzbekistan', country: 'UZ', confederation: 'AFC', cuisineTags: ['uzbek', 'central-asian', 'silk-road'], flagEmoji: '🇺🇿', signatureDishes: ['Plov', 'Manti', 'Samsa'] },
  { id: 'team-id', name: 'Indonesia', country: 'ID', confederation: 'AFC', cuisineTags: ['indonesian', 'southeast-asian', 'spicy'], flagEmoji: '🇮🇩', signatureDishes: ['Nasi Goreng', 'Rendang', 'Satay'] },

  // --- CAF (Africa) ---
  { id: 'team-ng', name: 'Nigeria', country: 'NG', confederation: 'CAF', cuisineTags: ['nigerian', 'west-african', 'spicy'], flagEmoji: '🇳🇬', signatureDishes: ['Jollof Rice', 'Suya', 'Puff Puff'] },
  { id: 'team-sn', name: 'Senegal', country: 'SN', confederation: 'CAF', cuisineTags: ['senegalese', 'west-african', 'seafood'], flagEmoji: '🇸🇳', signatureDishes: ['Thieboudienne', 'Yassa Chicken', 'Mafé'] },
  { id: 'team-ma', name: 'Morocco', country: 'MA', confederation: 'CAF', cuisineTags: ['moroccan', 'north-african', 'tagine'], flagEmoji: '🇲🇦', signatureDishes: ['Tagine', 'Couscous', 'Pastilla'] },
  { id: 'team-eg', name: 'Egypt', country: 'EG', confederation: 'CAF', cuisineTags: ['egyptian', 'north-african', 'middle-eastern'], flagEmoji: '🇪🇬', signatureDishes: ['Koshari', 'Ful Medames', 'Basbousa'] },
  { id: 'team-cm', name: 'Cameroon', country: 'CM', confederation: 'CAF', cuisineTags: ['cameroonian', 'central-african', 'stew'], flagEmoji: '🇨🇲', signatureDishes: ['Ndolé', 'Poulet DG', 'Puff Puff'] },
  { id: 'team-gh', name: 'Ghana', country: 'GH', confederation: 'CAF', cuisineTags: ['ghanaian', 'west-african', 'stew'], flagEmoji: '🇬🇭', signatureDishes: ['Jollof Rice', 'Kelewele', 'Banku with Tilapia'] },
  { id: 'team-ci', name: 'Ivory Coast', country: 'CI', confederation: 'CAF', cuisineTags: ['ivorian', 'west-african', 'grilled'], flagEmoji: '🇨🇮', signatureDishes: ['Attiéké', 'Alloco', 'Kedjenou'] },
  { id: 'team-tz', name: 'Tanzania', country: 'TZ', confederation: 'CAF', cuisineTags: ['tanzanian', 'east-african', 'coastal'], flagEmoji: '🇹🇿', signatureDishes: ['Ugali with Nyama Choma', 'Zanzibar Pizza', 'Pilau'] },

  // --- OFC (Oceania) ---
  { id: 'team-nz', name: 'New Zealand', country: 'NZ', confederation: 'OFC', cuisineTags: ['new-zealand', 'pacific', 'farm-to-table'], flagEmoji: '🇳🇿', signatureDishes: ['Lamb Rack', 'Pavlova', 'Hangi'] },
];

// Quick lookup maps
export const teamById = new Map(teams.map((t) => [t.id, t]));
export const teamByCountry = new Map(teams.map((t) => [t.country, t]));
export const teamByName = new Map(teams.map((t) => [t.name, t]));
