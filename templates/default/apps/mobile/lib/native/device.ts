import * as Device from 'expo-device';

/** The only module that talks to expo-device. */

/** Names this phone in the account's list of signed-in devices, e.g. "iPhone 15". */
export const deviceName = Device.modelName ?? undefined;
