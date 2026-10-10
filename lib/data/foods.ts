// Common Indian foods with carbohydrate per portion and glycaemic index (GI).
//
// These are approximate reference values, compiled from the International Tables of
// Glycemic Index (Atkinson et al., Diabetes Care 2008 and AJCN 2021), Indian GI studies
// of traditional foods, and the IFCT 2017 food composition tables. Real values vary with
// recipe, portion size, cooking time and what a food is eaten with. Treat them as
// starting points, not measurements.

export type FoodCategory =
  | "grains"
  | "dal & curry"
  | "breakfast"
  | "snacks"
  | "drinks"
  | "fruit"
  | "sweets";

export type Food = {
  id: string;
  name: string;
  portionLabel: string;
  carbsPerPortionG: number;
  gi: number;
  category: FoodCategory;
};

export const FOODS: Food[] = [
  // Grains
  { id: "roti", name: "Roti / chapati", portionLabel: "1 medium roti (40 g)", carbsPerPortionG: 18, gi: 62, category: "grains" },
  { id: "white-rice", name: "White rice", portionLabel: "1 katori cooked rice (150 g)", carbsPerPortionG: 42, gi: 73, category: "grains" },
  { id: "brown-rice", name: "Brown rice", portionLabel: "1 katori cooked rice (150 g)", carbsPerPortionG: 36, gi: 68, category: "grains" },
  { id: "jeera-rice", name: "Jeera rice", portionLabel: "1 katori cooked rice (150 g)", carbsPerPortionG: 43, gi: 69, category: "grains" },
  { id: "khichdi", name: "Moong dal khichdi", portionLabel: "1 katori khichdi (150 g)", carbsPerPortionG: 30, gi: 58, category: "grains" },
  { id: "bread-slice", name: "White bread", portionLabel: "1 slice (30 g)", carbsPerPortionG: 14, gi: 75, category: "grains" },

  // Dal & curry
  { id: "dal", name: "Dal (toor / moong)", portionLabel: "1 katori cooked dal (150 g)", carbsPerPortionG: 20, gi: 32, category: "dal & curry" },
  { id: "sambar", name: "Sambar", portionLabel: "1 katori sambar (150 g)", carbsPerPortionG: 15, gi: 40, category: "dal & curry" },
  { id: "rajma", name: "Rajma", portionLabel: "1 katori rajma (150 g)", carbsPerPortionG: 25, gi: 29, category: "dal & curry" },
  { id: "chole", name: "Chole", portionLabel: "1 katori chole (150 g)", carbsPerPortionG: 27, gi: 33, category: "dal & curry" },
  { id: "paneer-sabzi", name: "Paneer sabzi", portionLabel: "1 katori (150 g)", carbsPerPortionG: 8, gi: 30, category: "dal & curry" },
  { id: "mixed-veg", name: "Mixed veg sabzi", portionLabel: "1 katori (150 g)", carbsPerPortionG: 12, gi: 45, category: "dal & curry" },
  { id: "curd", name: "Plain curd", portionLabel: "1 katori (150 g)", carbsPerPortionG: 6, gi: 36, category: "dal & curry" },

  // Breakfast
  { id: "poha", name: "Poha", portionLabel: "1 plate (150 g)", carbsPerPortionG: 38, gi: 64, category: "breakfast" },
  { id: "upma", name: "Upma", portionLabel: "1 plate (150 g)", carbsPerPortionG: 35, gi: 68, category: "breakfast" },
  { id: "idli", name: "Idli", portionLabel: "2 idlis (100 g)", carbsPerPortionG: 24, gi: 69, category: "breakfast" },
  { id: "dosa", name: "Plain dosa", portionLabel: "1 dosa (80 g)", carbsPerPortionG: 29, gi: 77, category: "breakfast" },
  { id: "plain-paratha", name: "Plain paratha", portionLabel: "1 paratha (60 g)", carbsPerPortionG: 28, gi: 58, category: "breakfast" },
  { id: "aloo-paratha", name: "Aloo paratha", portionLabel: "1 paratha (100 g)", carbsPerPortionG: 40, gi: 65, category: "breakfast" },
  { id: "besan-chilla", name: "Besan chilla", portionLabel: "1 chilla (60 g)", carbsPerPortionG: 14, gi: 40, category: "breakfast" },
  { id: "oats", name: "Oats porridge", portionLabel: "1 bowl (40 g dry oats)", carbsPerPortionG: 27, gi: 55, category: "breakfast" },

  // Snacks
  { id: "samosa", name: "Samosa", portionLabel: "1 samosa (100 g)", carbsPerPortionG: 32, gi: 60, category: "snacks" },
  { id: "pakora", name: "Pakora", portionLabel: "4 pakoras (80 g)", carbsPerPortionG: 20, gi: 50, category: "snacks" },
  { id: "biscuits", name: "Marie biscuits", portionLabel: "4 biscuits (28 g)", carbsPerPortionG: 21, gi: 70, category: "snacks" },

  // Drinks
  { id: "chai-sugar", name: "Chai with sugar", portionLabel: "1 cup, 2 tsp sugar (150 ml)", carbsPerPortionG: 14, gi: 58, category: "drinks" },
  { id: "chai-no-sugar", name: "Chai without sugar", portionLabel: "1 cup (150 ml)", carbsPerPortionG: 5, gi: 31, category: "drinks" },
  { id: "sweet-lassi", name: "Sweet lassi", portionLabel: "1 glass (250 ml)", carbsPerPortionG: 35, gi: 55, category: "drinks" },

  // Fruit
  { id: "banana", name: "Banana", portionLabel: "1 medium banana (120 g)", carbsPerPortionG: 27, gi: 51, category: "fruit" },
  { id: "apple", name: "Apple", portionLabel: "1 medium apple (180 g)", carbsPerPortionG: 25, gi: 36, category: "fruit" },
  { id: "mango", name: "Mango", portionLabel: "1 cup slices (165 g)", carbsPerPortionG: 25, gi: 51, category: "fruit" },

  // Sweets
  { id: "gulab-jamun", name: "Gulab jamun", portionLabel: "1 piece (40 g)", carbsPerPortionG: 20, gi: 76, category: "sweets" },
  { id: "jalebi", name: "Jalebi", portionLabel: "2 pieces (50 g)", carbsPerPortionG: 32, gi: 80, category: "sweets" },
];
