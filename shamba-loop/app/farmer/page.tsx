import { auth } from "@clerk/nextjs/server";
import { FarmerDashboard } from "@/components/FarmerDashboard";

export default async function FarmerPage() {
  await auth.protect();
  return <FarmerDashboard />;
}
