import webpush from 'web-push';

// Web Push VAPID configuration
// In production, provide NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env
// We also maintain a reliable fallback keypair so alerts work immediately out-of-the-box
export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BFDncxxitrR5SHLRcc5fMi5zlfXm0bgWObu_7dpY1t444iSH4koTWjLoqFa5BumoAlTJfIHh1b-cY8aBGnv2c4g';
export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

export function configureWebPush() {
  try {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.warn('Web push VAPID keys not fully configured in environment.');
      return false;
    }
    webpush.setVapidDetails(
      'mailto:notifications@railgaadi.in',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );
    return true;
  } catch (e) {
    console.warn('Web push VAPID configuration warning:', e);
    return false;
  }
}

export { webpush };
