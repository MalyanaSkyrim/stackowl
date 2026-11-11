import { brand } from '@starter/common';

/**
 * The website of this build: staging builds open the staging site. The deploy workflow sets
 * `EXPO_PUBLIC_WEB_URL`; without it (development) links open the production site.
 */
const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL || brand.urls.website).replace(/\/+$/, '');

export const webUrls = {
  privacy: `${WEB_URL}/privacy`,
  terms: `${WEB_URL}/terms`,
  support: `${WEB_URL}/support`,
  website: WEB_URL,
};
