// Ingredient dictionary for the shopping list: translates English (and Dutch variants)
// to one Dutch name, and assigns a supermarket aisle. Unknown ingredients keep their
// own name and land under "Overig" — add a line here to teach it a new one.

export const AISLES = [
  { id: "gf", label: "Groenten & fruit" },
  { id: "br", label: "Brood & bakkerij" },
  { id: "vv", label: "Vlees, vis & vega" },
  { id: "zu", label: "Zuivel, eieren & koeling" },
  { id: "ka", label: "Kaas" },
  { id: "dr", label: "Pasta, rijst & granen" },
  { id: "we", label: "Wereldkeuken" },
  { id: "co", label: "Conserven & sauzen" },
  { id: "ol", label: "Olie & azijn" },
  { id: "kr", label: "Kruiden & specerijen" },
  { id: "ba", label: "Bakken & ontbijt" },
  { id: "no", label: "Noten & zaden" },
  { id: "di", label: "Diepvries" },
  { id: "dk", label: "Dranken" },
  { id: "ov", label: "Overig" },
] as const;

export type AisleId = (typeof AISLES)[number]["id"];

// Format: "dutch name|aisle|variant, variant, ..."  (the Dutch name itself is always a variant)
const DICTIONARY = `
aardappelen|gf|potato, potatoes, aardappel, aardappels, russet potato, russet potatoes, krieltjes, baby potatoes
zoete aardappel|gf|sweet potato, sweet potatoes, zoete aardappelen, bataat
ui|gf|onion, onions, uien, uitje, uitjes, yellow onion, white onion, gele ui, witte ui
rode ui|gf|red onion, red onions, rode uien
sjalot|gf|shallot, shallots, sjalotten, sjalotjes
lente-ui|gf|spring onion, spring onions, scallion, scallions, green onion, green onions, lente-uien, lenteui, lenteuitjes, lente-uitjes
knoflook|gf|garlic, garlic clove, garlic cloves, knoflookteen, knoflookteentjes, look
prei|gf|leek, leeks
wortelen|gf|carrot, carrots, wortel, wortels, worteltjes
selder|gf|celery, celery stalk, celery stalks, celery sticks, selderij, bleekselder, stoofselder, selderstengels
knolselder|gf|celeriac
tomaten|gf|tomato, tomatoes, tomaat, roma tomato, roma tomatoes, trostomaten, plum tomatoes
kerstomaten|gf|cherry tomato, cherry tomatoes, kerstomaatjes, cherry tomaatjes, cherrytomaten, cherrytomaatjes, tomaatjes
komkommer|gf|cucumber, cucumbers
paprika|gf|bell pepper, bell peppers, red pepper, red peppers, green pepper, yellow pepper, red bell pepper, green bell pepper, yellow bell pepper, paprikas, rode paprika, groene paprika, gele paprika
courgette|gf|zucchini, courgettes
aubergine|gf|eggplant, eggplants, aubergines
champignons|gf|mushroom, mushrooms, champignon, button mushrooms, chestnut mushrooms, kastanjechampignons
spinazie|gf|spinach, baby spinach, babyspinazie, jonge spinazie
sla|gf|lettuce, kropsla, ijsbergsla, iceberg lettuce, romaine, romaine lettuce, little gem
rucola|gf|arugula, rocket
veldsla|gf|lambs lettuce
witloof|gf|chicory, endive, belgian endive, witlof
roodlof|gf|radicchio
broccoli|gf|broccoli florets
bloemkool|gf|cauliflower
spruitjes|gf|brussels sprouts, brussel sprouts, spruiten
boerenkool|gf|kale
spitskool|gf|pointed cabbage, sweetheart cabbage
witte kool|gf|white cabbage, cabbage, kool
rode kool|gf|red cabbage
savooikool|gf|savoy cabbage
pompoen|gf|pumpkin, butternut, butternut squash, butternut pompoen, squash
venkel|gf|fennel
asperges|gf|asparagus, witte asperges, groene asperges
sperziebonen|gf|green beans, string beans, boontjes, prinsessenbonen, haricots verts, snijbonen
erwten|gf|peas, green peas, erwtjes, doperwten
peultjes|gf|snow peas, sugar snap peas, sugar snaps, sugarsnaps
avocado|gf|avocados
citroen|gf|lemon, lemons, citroenen, lemon wedges, lemon zest
citroensap|gf|lemon juice
limoen|gf|lime, limes, limoenen, lime wedges, lime zest
limoensap|gf|lime juice
sinaasappel|gf|orange, oranges, sinaasappelen, sinaasappels
mandarijnen|gf|clementine, clementines, mandarijn, tangerine, tangerines
appels|gf|apple, apples, appel
peren|gf|pear, pears, peer
bananen|gf|banana, bananas, banaan
aardbeien|gf|strawberry, strawberries, aardbei
frambozen|gf|raspberry, raspberries
blauwe bessen|gf|blueberry, blueberries
druiven|gf|grapes
mango|gf|mangos, mangoes
ananas|gf|pineapple
granaatappel|gf|pomegranate, pomegranate seeds, granaatappelpitjes
dadels|gf|dates, dadel, medjool dates, medjool dadels
gember|gf|ginger, fresh ginger, verse gember, gemberwortel
rode peper|gf|chili, chilli, chile, red chili, red chilli, chili pepper, chilli pepper, chilies, chillies, chilipeper, rode pepers
jalapeño|gf|jalapeno, jalapenos, jalapeños, jalapeno pepper, jalapeno peppers
basilicum|gf|basil, basil leaves, basilicumblaadjes
peterselie|gf|parsley, flat leaf parsley, platte peterselie, krulpeterselie
koriander|gf|cilantro, coriander, fresh coriander, verse koriander, korianderblaadjes
munt|gf|mint, mint leaves, muntblaadjes
bieslook|gf|chives
dille|gf|dill
tijm|gf|thyme, fresh thyme
rozemarijn|gf|rosemary
salie|gf|sage
radijsjes|gf|radish, radishes, radijs
rode biet|gf|beetroot, beets, rode bieten, gekookte rode biet
taugé|gf|bean sprouts, tauge
paksoi|gf|bok choy, pak choi, paksoy

brood|br|bread, loaf, boterhammen
stokbrood|br|baguette
broodjes|br|bread rolls, rolls, buns, burger buns, hamburger buns, hamburgerbroodjes, pistolets
wraps|br|tortilla, tortillas, wrap, tortilla wraps, flour tortillas
pitabroodjes|br|pita, pita bread, pitas
naanbrood|br|naan, naan bread
paneermeel|br|breadcrumbs, bread crumbs
panko|br|panko breadcrumbs

gehakt|vv|ground beef, minced beef, mince, ground meat, minced meat, gemengd gehakt, rundergehakt, varkensgehakt, ground pork, kalfsgehakt
kipfilet|vv|kip filet, chicken breast, chicken breasts, chicken fillet, chicken fillets, kippenborst, kippenfilet, kip, chicken
kippendijen|vv|chicken thigh, chicken thighs, kippendijfilet, dijfilet, boneless chicken thighs
spek|vv|bacon, spekblokjes, spekjes, lardons, ontbijtspek, pancetta
ham|vv|gekookte ham, hesp
chorizo|vv|
worsten|vv|sausage, sausages, worst, braadworst, chipolata
stoofvlees|vv|stewing beef, beef chuck, runderstoofvlees, stoofvlees van rund
rundvlees|vv|beef
biefstuk|vv|steak, steaks, beef steak, entrecote
varkenshaas|vv|pork tenderloin
varkensvlees|vv|pork, pork shoulder, varkensschouder, varkensnek, pork neck
lamsvlees|vv|lamb
zalm|vv|salmon, salmon fillet, salmon fillets, zalmfilet, zalmfilets
kabeljauw|vv|cod, cod fillet, kabeljauwfilet
witte vis|vv|white fish, pangasius, koolvis
garnalen|vv|shrimp, shrimps, prawns, scampi, gambas, grijze garnalen
mosselen|vv|mussels
tofu|vv|firm tofu
tempeh|vv|

melk|zu|milk, whole milk, volle melk, halfvolle melk, semi skimmed milk
room|zu|cream, heavy cream, double cream, single cream, kookroom, slagroom, whipping cream, cooking cream, vloeibare room
zure room|zu|sour cream, low fat sour cream, soured cream
crème fraîche|zu|creme fraiche
boter|zu|butter, unsalted butter, salted butter, roomboter
yoghurt|zu|yogurt, greek yogurt, greek yoghurt, griekse yoghurt, natural yogurt, plain yogurt, natuuryoghurt
eieren|zu|egg, eggs, ei
eidooiers|zu|egg yolk, egg yolks, eidooier, eierdooier, eierdooiers, eigeel
kwark|zu|quark
roomkaas|zu|cream cheese, philadelphia, verse kaas
mascarpone|zu|
bladerdeeg|zu|puff pastry
pizzadeeg|zu|pizza dough

kaas|ka|cheese, grated cheese, shredded cheese, gemalen kaas, geraspte kaas
parmezaan|ka|parmesan, parmigiano, parmigiano reggiano, parmezaanse kaas, grana padano
mozzarella|ka|buffelmozzarella, buffalo mozzarella
feta|ka|fetakaas, feta cheese
cheddar|ka|cheddar cheese
geitenkaas|ka|goat cheese, goats cheese
gruyère|ka|gruyere
ricotta|ka|

pasta|dr|
spaghetti|dr|
penne|dr|
fusilli|dr|spirelli
tagliatelle|dr|
macaroni|dr|
lasagnevellen|dr|lasagne sheets, lasagna sheets, lasagna noodles, lasagne
rijst|dr|rice, white rice, witte rijst, basmati, basmati rice, basmatirijst, jasmine rice, jasmijnrijst, long grain rice
risottorijst|dr|arborio, arborio rice, risotto rice
couscous|dr|
bulgur|dr|
quinoa|dr|
noedels|dr|noodles, egg noodles, rice noodles, mie, rijstnoedels, udon, ramen noodles
gnocchi|dr|

sojasaus|we|soy sauce, soya sauce
ketjap manis|we|kecap manis, sweet soy sauce, ketjap
kokosmelk|we|coconut milk, kokosroom, coconut cream
currypasta|we|curry paste, red curry paste, green curry paste, rode currypasta, groene currypasta
vissaus|we|fish sauce
sesamolie|we|sesame oil
hoisinsaus|we|hoisin, hoisin sauce
sriracha|we|
sambal|we|sambal oelek
rijstazijn|we|rice vinegar
mirin|we|
miso|we|miso paste
tacokruiden|we|taco seasoning, taco kruiden

tomatenpulp|co|crushed tomatoes, diced tomatoes, chopped tomatoes, canned tomatoes, tinned tomatoes, tomatenblokjes, gepelde tomaten, tomaten in blik, tomatenstukjes
passata|co|tomato passata, gezeefde tomaten
tomatenpuree|co|tomato paste, tomato puree, tomatenconcentraat
tomatensaus|co|tomato sauce, pasta sauce, pastasaus
kikkererwten|co|chickpeas, garbanzo beans
zwarte bonen|co|black beans
kidneybonen|co|kidney beans, red kidney beans, rode bonen
witte bonen|co|white beans, cannellini beans, cannellini, butter beans
linzen|co|lentils, red lentils, green lentils, rode linzen, groene linzen
maïs|co|corn, sweetcorn, sweet corn, mais, maiskorrels
bouillon|co|stock, broth, bouillonblokje, bouillonblokjes, stock cube, stock cubes
kippenbouillon|co|chicken stock, chicken broth, kippenbouillonblokje, kippenbouillonblokjes
groentebouillon|co|vegetable stock, vegetable broth, groentebouillonblokje, groentebouillonblokjes
runderbouillon|co|beef stock, beef broth
pesto|co|groene pesto, basil pesto
mosterd|co|mustard, dijon mustard, dijon, graanmosterd, whole grain mustard, wholegrain mustard
mayonaise|co|mayonnaise, mayo
ketchup|co|
kappertjes|co|capers
olijven|co|olives, black olives, green olives, kalamata olives, zwarte olijven, groene olijven
augurken|co|pickles, gherkins
tonijn|co|tuna, canned tuna, tonijn in blik
ansjovis|co|anchovies, anchovy, ansjovisfilets

olijfolie|ol|olive oil, extra virgin olive oil, extra vierge olijfolie
olie|ol|oil, neutral oil, vegetable oil, sunflower oil, zonnebloemolie, arachideolie, neutrale olie, canola oil, rapeseed oil, koolzaadolie, sunflower or vegetable oil
azijn|ol|vinegar, white vinegar
wijnazijn|ol|wine vinegar, red wine vinegar, white wine vinegar, rode wijnazijn, witte wijnazijn
balsamico|ol|balsamic vinegar, balsamic, balsamicoazijn
appelazijn|ol|apple cider vinegar, cider vinegar, appelcider, appelciderazijn

zout|kr|salt, sea salt, zeezout, kosher salt, fleur de sel, grof zout
peper|kr|black pepper, pepper, zwarte peper, ground black pepper, versgemalen peper, witte peper, white pepper
peper en zout|kr|salt and pepper, zout en peper
paprikapoeder|kr|paprika powder, ground paprika, sweet paprika, edelzoet paprikapoeder
gerookt paprikapoeder|kr|smoked paprika, gerookte paprikapoeder
komijn|kr|cumin, ground cumin, komijnpoeder, gemalen komijn, djinten, cumin seeds, komijnzaad
kurkuma|kr|turmeric, geelwortel
kerriepoeder|kr|curry powder, curry, kerrie
chilipoeder|kr|chili powder, chilli powder
chilivlokken|kr|chili flakes, chilli flakes, red pepper flakes, crushed red pepper
cayennepeper|kr|cayenne, cayenne pepper
kaneel|kr|cinnamon, ground cinnamon
nootmuskaat|kr|nutmeg
oregano|kr|dried oregano
italiaanse kruiden|kr|italian seasoning, italian herbs, mixed herbs
provençaalse kruiden|kr|herbes de provence, provencaalse kruiden
knoflookpoeder|kr|garlic powder, granulated garlic
uienpoeder|kr|onion powder
laurier|kr|bay leaf, bay leaves, laurierblad, laurierblaadjes
garam masala|kr|
gemalen koriander|kr|ground coriander, korianderpoeder, coriander seeds, korianderzaad
gemberpoeder|kr|ground ginger, gemalen gember
kruidnagels|kr|ground cloves, kruidnagel
steranijs|kr|star anise
fenegriek|kr|fenugreek, fenugreek leaves, fenegriekblad, fenegriekblaadjes, kasoori methi, kasuri methi

bloem|ba|flour, all purpose flour, plain flour, tarwebloem
zelfrijzende bloem|ba|self raising flour, self rising flour
suiker|ba|sugar, granulated sugar, caster sugar, white sugar, kristalsuiker, fijne suiker, witte suiker
bruine suiker|ba|brown sugar, light brown sugar, dark brown sugar, basterdsuiker, cassonade
poedersuiker|ba|icing sugar, powdered sugar, confectioners sugar
bakpoeder|ba|baking powder
baking soda|ba|bicarbonate of soda, zuiveringszout, natriumbicarbonaat
gist|ba|yeast, dried yeast, droge gist, instant yeast
maïzena|ba|cornstarch, cornflour, corn starch, maizena
honing|ba|honey
ahornsiroop|ba|maple syrup
chocolade|ba|chocolate, dark chocolate, pure chocolade, chocolate chips
cacaopoeder|ba|cocoa, cocoa powder, cacao
havermout|ba|oats, rolled oats, oatmeal, havervlokken
pindakaas|ba|peanut butter
jam|ba|
vanille-extract|ba|vanilla, vanilla extract, vanilla essence, vanille
vanillesuiker|ba|vanilla sugar

walnoten|no|walnuts, walnut
amandelen|no|almonds, gemalen amandelen, ground almonds, amandelschilfers, flaked almonds
cashewnoten|no|cashews, cashew nuts
pinda's|no|peanuts, pindas
pijnboompitten|no|pine nuts
hazelnoten|no|hazelnuts
sesamzaad|no|sesame seeds, sesamzaadjes
rozijnen|no|raisins
zonnebloempitten|no|sunflower seeds
pompoenpitten|no|pumpkin seeds
chiazaad|no|chia seeds

ijs|di|ice cream, roomijs

rode wijn|dk|red wine
witte wijn|dk|white wine, dry white wine
bier|dk|beer
`;

/** Ingredients that never belong on a shopping list. */
const SKIP = new Set(["water", "warm water", "cold water", "hot water", "lauw water", "koud water", "kraantjeswater", "ijsblokjes", "ice"]);

type Entry = { nl: string; aisle: AisleId };

/** Lowercase, no accents, no apostrophes, hyphens as spaces: "Lente-uitjes" → "lente uitjes". */
export function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/['’`]/g, "")
    .replace(/[-_/]/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const LOOKUP = new Map<string, Entry>();
for (const line of DICTIONARY.split("\n")) {
  if (!line.trim()) continue;
  const [nl, aisle, variants] = line.split("|");
  const entry = { nl: nl.trim(), aisle: aisle.trim() as AisleId };
  for (const v of [nl, ...(variants ?? "").split(",")]) {
    const key = normalizeName(v);
    if (key && !LOOKUP.has(key)) LOOKUP.set(key, entry);
  }
}

/** Plural/singular variants to try: "tomatoes" → "tomato", "uien" → "ui". */
function variants(key: string): string[] {
  const out = [key];
  if (key.endsWith("ies")) out.push(key.slice(0, -3) + "y");
  if (key.endsWith("es")) out.push(key.slice(0, -2));
  if (key.endsWith("s")) out.push(key.slice(0, -1));
  if (key.endsWith("en")) out.push(key.slice(0, -2));
  return out;
}

function find(key: string): Entry | undefined {
  for (const v of variants(key)) {
    const e = LOOKUP.get(v);
    if (e) return e;
  }
  return undefined;
}

export type GroceryInfo = { name: string; aisle: AisleId; skip?: boolean };

/**
 * Maps an ingredient name to its Dutch shopping name + aisle.
 * Tries an exact match, then the longest known ending ("russet potatoes" → "potatoes"),
 * since the main word comes last in both Dutch and English.
 */
export function classifyIngredient(rawName: string, unit?: string, quantity?: number): GroceryInfo {
  const key = normalizeName(rawName);
  if (SKIP.has(key)) return { name: rawName, aisle: "ov", skip: true };

  // "paprika" is a vegetable in Dutch but the spice in English: small amounts = the spice
  if (key === "paprika" && unit && (["tsp", "tbsp", "pinch"].includes(unit) || (unit === "g" && (quantity ?? 0) < 30))) {
    return { name: "paprikapoeder", aisle: "kr" };
  }

  const exact = find(key);
  if (exact) return { name: exact.nl, aisle: exact.aisle };

  const words = key.split(" ");
  for (let i = 1; i < words.length; i++) {
    const tail = find(words.slice(i).join(" "));
    if (tail) return { name: tail.nl, aisle: tail.aisle };
  }

  return { name: rawName.trim().toLowerCase(), aisle: "ov" };
}

export function aisleLabel(id: AisleId): string {
  return AISLES.find((a) => a.id === id)?.label ?? "Overig";
}

export function aisleOrder(id: AisleId): number {
  return AISLES.findIndex((a) => a.id === id);
}
