export const drillResources = [
  { id: 'coal', catalogId: 10, name: 'Уголь', color: '#202329', image: 'assets/resources/coal.png' },
  { id: 'iron', catalogId: 11, name: 'Железная руда', color: '#73808b', image: 'assets/resources/iron.png' },
  { id: 'copper', catalogId: 12, name: 'Медная руда', color: '#c7784e', image: 'assets/resources/copper.png' },
  { id: 'tin', catalogId: 13, name: 'Оловянная руда', color: '#a7b7c2', image: 'assets/resources/tin.png' },
  { id: 'silver', catalogId: 14, name: 'Серебряная руда', color: '#d6dbe1', image: 'assets/resources/silver.png' },
  { id: 'gold', catalogId: 15, name: 'Золотая руда', color: '#e1b139', image: 'assets/resources/gold.png' },
  { id: 'tungsten', catalogId: 16, name: 'Вольфрамовая руда', color: '#48525b', image: 'assets/resources/tungsten.png' },
  { id: 'platinum', catalogId: 17, name: 'Платиновая руда', color: '#79a1a8', image: 'assets/resources/platinum.png' },
  { id: 'diamond', catalogId: 18, name: 'Алмазная руда', color: '#59bdd8', image: 'assets/resources/diamond.png' },
];

const powderNames = {
  iron: 'Железный порошок', copper: 'Медный порошок', tin: 'Оловянный порошок', silver: 'Серебряный порошок',
  gold: 'Золотой порошок', tungsten: 'Вольфрамовый порошок', platinum: 'Платиновый порошок', diamond: 'Алмазный порошок',
};

export const crushedResources = drillResources.slice(1).map((resource, index) => ({
  id: `${resource.id}-powder`,
  catalogId: 20 + index,
  name: powderNames[resource.id],
  color: resource.color,
  image: `assets/powders/${resource.id}-powder.png`,
}));

export const smeltedResources = [
  { id: 'iron-ingot', catalogId: 30, name: 'Железный слиток', color: '#73808b', image: 'assets/ingots/iron-ingot.png' },
  { id: 'copper-ingot', catalogId: 31, name: 'Медный слиток', color: '#c7784e', image: 'assets/ingots/copper-ingot.png' },
  { id: 'tin-ingot', catalogId: 32, name: 'Оловянный слиток', color: '#a7b7c2', image: 'assets/ingots/tin-ingot.png' },
  { id: 'silver-ingot', catalogId: 33, name: 'Серебряный слиток', color: '#d6dbe1', image: 'assets/ingots/silver-ingot.png' },
  { id: 'gold-ingot', catalogId: 34, name: 'Золотой слиток', color: '#e1b139', image: 'assets/ingots/gold-ingot.png' },
  { id: 'tungsten-ingot', catalogId: 35, name: 'Вольфрамовый слиток', color: '#48525b', image: 'assets/ingots/tungsten-ingot.png' },
  { id: 'platinum-ingot', catalogId: 36, name: 'Платиновый слиток', color: '#79a1a8', image: 'assets/ingots/platinum-ingot.png' },
  { id: 'diamond-ingot', catalogId: 37, name: 'Алмаз', color: '#59bdd8', image: 'assets/ingots/diamond.png' },
];

export const pressedResources = smeltedResources.map((resource) => ({
  id: resource.id.replace('-ingot', '-plate'),
  catalogId: resource.catalogId + 10,
  name: resource.name === 'Алмаз' ? 'Алмазная пластина' : resource.name.replace('слиток', 'пластина'),
  color: resource.color,
  image: `assets/plates/${resource.id.replace('-ingot', '')}-plate.png`,
}));

const gearNames = {
  iron: 'Железная шестерёнка',
  copper: 'Медная шестерёнка',
  tin: 'Оловянная шестерёнка',
  silver: 'Серебряная шестерёнка',
  gold: 'Золотая шестерёнка',
  tungsten: 'Вольфрамовая шестерёнка',
  platinum: 'Платиновая шестерёнка',
  diamond: 'Алмазная шестерёнка',
};

export const gearResources = smeltedResources.map((resource) => ({
  id: resource.id.replace('-ingot', '-gear'),
  catalogId: resource.catalogId + 20,
  name: gearNames[resource.id.replace('-ingot', '')],
  color: resource.color,
  image: `assets/gears/${resource.id.replace('-ingot', '')}-gear.png`,
}));

export function getResourceType(resourceId) {
  return [...drillResources, ...crushedResources, ...smeltedResources, ...pressedResources, ...gearResources].find((resource) => resource.id === resourceId) ?? null;
}
