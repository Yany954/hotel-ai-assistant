// No self-registration anywhere in the system. Accounts are created only through the admin API
// (see interfaces/admin-panel) using the Firebase Admin SDK, which also sets a custom claim for
// role. This middleware just reads and enforces that claim on every request.

export type Role = "front_desk" | "admin";

export interface AuthenticatedUser {
  id: string;
  role: Role;
}

// TODO: verifyIdToken(req.headers.authorization) via Firebase Admin SDK,
// then read decodedToken.role (custom claim) into AuthenticatedUser.
export async function requireRole(_minRole: Role) {
  throw new Error("not implemented yet");
}
