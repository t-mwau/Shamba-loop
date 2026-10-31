import { auth } from "@clerk/nextjs/server";
import { OffersInbox } from "@/components/OffersInbox";

export default async function OffersPage() {
  await auth.protect();
  return <OffersInbox />;
}
