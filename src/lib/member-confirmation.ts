export function confirmedMembership(invitationAccepted: boolean, timestamp: string) {
  if (!invitationAccepted) throw new Error("Invitation not accepted");
  return { approval_status: "approved" as const, approved_at: timestamp, invitation_sent_at: timestamp };
}

export function memberInvitationUrl(origin: string) {
  const url = new URL(origin);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && url.hostname === "localhost")) throw new Error("Invalid invitation origin");
  return new URL("/auth?member=true", url.origin).href;
}