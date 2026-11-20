/**
 * Mengambil token dari header `Authorization: Bearer <token>`.
 * Mengembalikan `null` bila header tidak valid/kosong.
 */
export function extractBearerToken(
  authHeader: string | undefined,
): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}
