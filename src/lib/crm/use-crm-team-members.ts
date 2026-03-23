"use client";

import { useEffect, useState } from "react";
import type { MockTeamMember } from "@/lib/crm/mock-data";
import { readStoredTeamMembers } from "@/lib/crm/team-members-storage";

/**
 * Team roster persisted from the Team page (localStorage). Updates when members
 * are added or when another tab fires `storage`.
 */
export function useCrmTeamMembers() {
  const [members, setMembers] = useState<MockTeamMember[]>([]);

  useEffect(() => {
    setMembers(readStoredTeamMembers());
    const sync = () => setMembers(readStoredTeamMembers());
    window.addEventListener("storage", sync);
    window.addEventListener("crm-team-members-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("crm-team-members-changed", sync);
    };
  }, []);

  return members;
}
