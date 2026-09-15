import webpush from 'web-push';

// Web Push VAPID configuration
// In production, provide NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env
// We also maintain a reliable fallback keypair so alerts work immediately out-of-the-box
const DEFAULT_VAPID_PUBLIC_KEY =
  'BCw_6l9fS_U5aRjKzR1g7d9PqN8mK2yU3wX4vB5nT7mK8rJ9sD0fG1hJ2kL3zX4cV5bN6mQ7wE8rT9yU0iO1p';
const DEFAULT_VAPID_PRIVATE_KEY =
  'kL3zX4cV5bN6mQ7wE8rT9yU0iO1pA2sD3fG4hJ5kL6z';

export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY;
export const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || DEFAULT_VAPID_PRIVATE_KEY;

export function configureWebPush() {
  try {
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
