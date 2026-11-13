import { auth, currentUser } from "@clerk/nextjs/server";
import { FarmerDashboard } from "@/components/FarmerDashboard";

export default async function FarmerPage() {
  await auth.protect();
  const user = await currentUser();
  const farmerName = user?.firstName || user?.username || "there";
  return <FarmerDashboard farmerName={farmerName} />;
}
