// Café drinks for order-ahead. Prices in pence from the live Shopify store on 30 Oct 2026.
// Plant milks cost 40p more, as on the live menu. The live store listed Iced Hazelnut Latte,
// Regular, Coconut at £4.80 instead of £5.00; this menu uses the £5.00 pattern of every other drink.

export type Milk = "Whole" | "Semi skim" | "Oat" | "Coconut";
export type DrinkSize = "Regular" | "Large";

export type Drink = {
  id: string;
  name: string;
  category: "Hot coffee" | "Iced coffee" | "Matcha" | "Iced matcha";
  prices: Partial<Record<DrinkSize, number>>; // with whole milk
  milks: Milk[];
  image: string;
  imageAlt: string;
};

export const PLANT_MILK_SURCHARGE = 40;
export const PLANT_MILKS: Milk[] = ["Oat", "Coconut"];

const COFFEE_MILKS: Milk[] = ["Whole", "Oat", "Coconut"];
const MATCHA_MILKS: Milk[] = ["Whole", "Semi skim", "Oat", "Coconut"];
const HOT = { image: "/images/hot-coffee.webp", imageAlt: "Latte art in an Isaac's Coffee takeaway cup" };
const ICED = { image: "/images/iced-matcha.webp", imageAlt: "Iced drink in a clear takeaway cup at Isaac's Coffee" };
const MATCHA = { image: "/images/matcha-latte.webp", imageAlt: "Hot matcha latte with latte art at Isaac's Coffee" };
const ICED_MATCHA = { image: "/images/iced-matcha.webp", imageAlt: "Iced matcha latte in a clear takeaway cup at Isaac's Coffee" };

const hot = (id: string, name: string, regular: number, large?: number): Drink => ({
  id, name, category: "Hot coffee", prices: large ? { Regular: regular, Large: large } : { Regular: regular }, milks: COFFEE_MILKS, ...HOT,
});
const iced = (id: string, name: string, regular: number, large: number, milks = COFFEE_MILKS): Drink => ({
  id, name, category: "Iced coffee", prices: { Regular: regular, Large: large }, milks, ...ICED,
});

export const DRINKS: Drink[] = [
  hot("latte", "Latte", 390, 410),
  hot("flat-white", "Flat White", 370),
  hot("cappuccino", "Cappuccino", 390, 410),
  hot("mocha", "Mocha", 440, 460),
  hot("vanilla-latte", "Vanilla Latte", 440, 460),
  hot("caramel-latte", "Caramel Latte", 440, 460),
  hot("hazelnut-latte", "Hazelnut Latte", 440, 460),
  hot("pistachio-latte", "Pistachio Latte", 490, 510),
  hot("biscoff-latte", "Biscoff Latte", 490, 510),
  hot("spanish-latte", "Spanish Latte", 490, 510),
  iced("iced-black", "Iced Black", 390, 450, ["Whole"]),
  iced("iced-latte", "Iced Latte", 410, 470),
  iced("iced-vanilla-latte", "Iced Vanilla Latte", 460, 520),
  iced("iced-caramel-latte", "Iced Caramel Latte", 460, 520),
  iced("iced-mocha", "Iced Mocha", 460, 520),
  iced("iced-hazelnut-latte", "Iced Hazelnut Latte", 460, 520),
  iced("iced-pistachio-latte", "Iced Pistachio Latte", 510, 570),
  iced("iced-biscoff-latte", "Iced Biscoff Latte", 510, 570),
  iced("iced-spanish-latte", "Iced Spanish Latte", 510, 570),
  { id: "matcha-latte", name: "Matcha Latte", category: "Matcha", prices: { Regular: 420, Large: 450 }, milks: MATCHA_MILKS, ...MATCHA },
  { id: "vanilla-matcha-latte", name: "Vanilla Matcha Latte", category: "Matcha", prices: { Regular: 470, Large: 500 }, milks: MATCHA_MILKS, ...MATCHA },
  { id: "iced-matcha", name: "Iced Matcha", category: "Iced matcha", prices: { Regular: 450, Large: 470 }, milks: MATCHA_MILKS, ...ICED_MATCHA },
  { id: "iced-vanilla-matcha", name: "Iced Vanilla Matcha", category: "Iced matcha", prices: { Regular: 500, Large: 520 }, milks: MATCHA_MILKS, ...ICED_MATCHA },
  { id: "iced-blueberry-matcha", name: "Iced Blueberry Matcha", category: "Iced matcha", prices: { Regular: 500, Large: 520 }, milks: MATCHA_MILKS, ...ICED_MATCHA },
  { id: "iced-strawberry-matcha", name: "Iced Strawberry Matcha", category: "Iced matcha", prices: { Regular: 500, Large: 520 }, milks: MATCHA_MILKS, ...ICED_MATCHA },
  { id: "iced-white-chocolate-matcha", name: "Iced White Chocolate Matcha", category: "Iced matcha", prices: { Regular: 550, Large: 570 }, milks: MATCHA_MILKS, ...ICED_MATCHA },
];

export const getDrink = (id: string) => DRINKS.find((d) => d.id === id);
