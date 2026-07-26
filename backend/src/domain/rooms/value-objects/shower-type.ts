// Value object: keeps "bathtub" vs "walk-in shower" vs "combo" as an explicit, closed set instead
// of a free-text field — this is what makes filtering deterministic instead of fuzzy.

export type ShowerType = "walk_in_shower" | "bathtub" | "tub_shower_combo";
