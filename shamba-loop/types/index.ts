export type WasteType = "Maize stalks" | "Coffee husks" | "Manure" | "Rice husks";

export type ListingStatus = "Available" | "Offer received" | "Pickup scheduled";

export interface Listing {
  id: string;
  wasteType: WasteType;
  quantityKg: number;
  pricePerKg: number;
  location: string;
  distanceKm: number;
  farmerName: string;
  quality: string;
  availableDate: string;
  status: ListingStatus;
}

export interface Offer {
  id: string;
  listingId: string;
  listingName: string;
  farmerName: string;
  processorName: string;
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
  pickupDate: string;
  message: string;
  status: "Pending" | "Accepted" | "Declined";
}

export interface NewListing {
  wasteType: WasteType;
  quantityKg: number;
  pricePerKg: number;
  location: string;
  availableDate: string;
}
