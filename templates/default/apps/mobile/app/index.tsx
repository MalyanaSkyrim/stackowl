import { Redirect } from 'expo-router';

/** The app opens on the tabs. Add an onboarding screen here if your app needs one. */
export default function Index() {
  return <Redirect href="/(home)" />;
}
