import { createStore } from 'jotai';

/**
 * The app's Jotai store. The root layout provides it; code outside React (notification
 * handlers, background tasks) can read and write atoms through it.
 */
export const appStore = createStore();
