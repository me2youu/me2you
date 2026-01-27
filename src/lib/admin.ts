// Admin authorization helper
// Add admin Clerk user IDs to ADMIN_USER_IDS in .env.local (comma-separated)

export function isAdmin(userId: string | null): boolean {
  if (!userId) return false;

  const adminIds = process.env.ADMIN_USER_IDS?.split(',').map((id) => id.trim()) || [];
  return adminIds.includes(userId);
}
