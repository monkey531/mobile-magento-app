<<<<<<< HEAD
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
=======
import { Redirect } from 'expo-router';

export default function AppLayout() {
  // On web, static rendering will stop here as the user is not authenticated
  // in the headless Node process that the pages are rendered in.
  return <Redirect href="/(auth)/login" />;
}
>>>>>>> 70070cd6cf05a5dcd2f286552c2d035c365e8cc4
