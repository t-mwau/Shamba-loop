import type { NewListing, WasteType } from "@/types";

const wasteTypes: WasteType[] = ["Maize stalks", "Coffee husks", "Manure", "Rice husks"];
const availableDates = ["Ready today", "Ready tomorrow", "Ready this week", "Ready next week"];

function isWasteType(value: unknown): value is WasteType {
  return typeof value === "string" && wasteTypes.some((wasteType) => wasteType === value);
}

export type NewListingValidation =
  | { success: true; data: NewListing }
  | { success: false; error: string };

export function validateNewListing(formData: FormData): NewListingValidation {
  return validateListingInput({
    wasteType: formData.get("wasteType"),
    quantityKg: formData.get("quantityKg"),
    pricePerKg: formData.get("pricePerKg"),
    location: formData.get("location"),
    availableDate: formData.get("availableDate"),
  });
}

export function validateListingInput(input: Record<string, unknown>): NewListingValidation {
  const wasteType = input.wasteType;
  const quantityKg = Number(input.quantityKg);
  const pricePerKg = Number(input.pricePerKg);
  const location = typeof input.location === "string" ? input.location.trim() : "";
  const availableDate = input.availableDate;

  if (!isWasteType(wasteType)) {
    return { success: false, error: "Choose a supported farm waste type." };
  }
  if (!Number.isFinite(quantityKg) || quantityKg < 1 || quantityKg > 1_000_000_000) {
    return { success: false, error: "Quantity must be between 1 kg and 1 billion kg." };
  }
  if (!Number.isFinite(pricePerKg) || pricePerKg < 1 || pricePerKg > 1_000_000) {
    return { success: false, error: "Price must be between KSh 1 and KSh 1 million per kg." };
  }
  if (!location || location.length > 120) {
    return { success: false, error: "Enter a pickup location." };
  }
  if (typeof availableDate !== "string" || !availableDates.includes(availableDate)) {
    return { success: false, error: "Choose when the waste will be ready." };
  }

  return {
    success: true,
    data: { wasteType, quantityKg, pricePerKg, location, availableDate },
  };
}
