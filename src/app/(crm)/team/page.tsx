import TeamsView from "@/components/crm/TeamsView";
import { teamMembers } from "@/lib/crm/mock-data";

export const dynamic = "force-dynamic";

export default function TeamPage() {
  return (
    <div className="p-8">
      <TeamsView members={teamMembers} />
    </div>
  );
}
