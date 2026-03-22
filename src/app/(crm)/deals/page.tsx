import DealsView from "@/components/crm/DealsView";
import { deals } from "@/lib/crm/mock-data";

export const dynamic = "force-dynamic";

export default function DealsPage() {
  return (
    <div className="p-8">
      <DealsView deals={deals} />
    </div>
  );
}
