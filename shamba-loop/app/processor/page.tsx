import { auth } from "@clerk/nextjs/server";
import { ProcessorMarketplace } from "@/components/ProcessorMarketplace";

export default async function ProcessorPage() {
  await auth.protect();
  return <ProcessorMarketplace />;
}
