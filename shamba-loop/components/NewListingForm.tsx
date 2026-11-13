"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMarketplace } from "@/components/MarketplaceProvider";
import { validateNewListing } from "@/lib/validators";
import { Button } from "@/components/ui/Button";

export function NewListingForm() {
  const router = useRouter();
  const { createListing, saving } = useMarketplace();
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = validateNewListing(formData);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setError("");
    if (await createListing(result.data)) {
      router.push("/farmer");
    }
  }

  return (
    <form className="listing-form" onSubmit={handleSubmit}>
      <div className="form-section-heading"><span>01</span><div><h2>What do you have?</h2><p>Tell processors what you’re ready to sell.</p></div></div>
      <label className="field-label">Type of farm waste
        <select name="wasteType" defaultValue="Maize stalks" required>
          <option>Maize stalks</option>
          <option>Coffee husks</option>
          <option>Manure</option>
          <option>Rice husks</option>
        </select>
      </label>
      <div className="form-row">
        <label className="field-label">Available quantity
          <span className="input-with-suffix"><input name="quantityKg" min="1" max="1000000000" placeholder="e.g. 500" required type="number" /><span>kg</span></span>
        </label>
        <label className="field-label">Your asking price
          <span className="input-with-suffix"><span>KSh</span><input name="pricePerKg" min="1" max="1000000" placeholder="e.g. 8" required type="number" /><span>/kg</span></span>
        </label>
      </div>
      <div className="form-section-heading form-section-spaced"><span>02</span><div><h2>Where and when?</h2><p>Help nearby buyers plan a pickup.</p></div></div>
      <label className="field-label">Pickup location
        <input autoComplete="address-level2" name="location" placeholder="Town, county (e.g. Njoro, Nakuru)" required />
      </label>
      <label className="field-label">When is it ready?
        <select name="availableDate" defaultValue="Ready today" required>
          <option>Ready today</option>
          <option>Ready tomorrow</option>
          <option>Ready this week</option>
          <option>Ready next week</option>
        </select>
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-submit-row">
        <p>Free to list. You agree the final weight is confirmed at pickup.</p>
        <Button disabled={saving} type="submit">{saving ? "Publishing…" : "Publish listing"} <span aria-hidden="true">→</span></Button>
      </div>
    </form>
  );
}
