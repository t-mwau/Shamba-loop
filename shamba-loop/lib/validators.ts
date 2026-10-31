import type { NewListing, WasteType } from "@/types";

const wasteTypes: WasteType[] = ["Maize stalks", "Coffee husks", "Manure", "Rice husks"];
const availableDates = ["Ready today", "Ready tomorrow", "Ready this week", "Ready next week"];

function isWasteType(value: FormDataEntryValue | null): value is WasteType {
  return typeof value === "string" && wasteTypes.some((wasteType) => wasteType === value);
}

export type NewListingValidation =
  | { success: true; data: NewListing }
  | { success: false; error: string };

export function validateNewListing(formData: FormData): NewListingValidation {
  const wasteType = formData.get("wasteType");
  const quantityKg = Number(formData.get("quantityKg"));
  const pricePerKg = Number(formData.get("pricePerKg"));
  const location = String(formData.get("location") ?? "").trim();
  const availableDate = String(formData.get("availableDate") ?? "");

  if (!isWasteType(wasteType)) {
    return { success: false, error: "Choose a supported farm waste type." };
  }
  if (!Number.isFinite(quantityKg) || quantityKg < 1) {
    return { success: false, error: "Quantity must be at least 1 kg." };
  }
  if (!Number.isFinite(pricePerKg) || pricePerKg < 1) {
    return { success: false, error: "Price must be at least KSh 1 per kg." };
  }
  if (!location) {
    return { success: false, error: "Enter a pickup location." };
  }
  if (!availableDates.includes(availableDate)) {
    return { success: false, error: "Choose when the waste will be ready." };
  }

  return {
    success: true,
    data: { wasteType, quantityKg, pricePerKg, location, availableDate },
  };
}
