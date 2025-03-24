import { useEffect } from 'react'
import { View, Text } from 'react-native'
import { useSession } from '@/providers/AuthProvider';
import { router } from 'expo-router';


const index = () => {
  const {session, signOut} = useSession();

  useEffect(() => {
    if(!session) router.navigate("/(auth)/login");
  }, [session]);

  return (
    <View>
      <Text>
        LLL
      </Text>
    </View>
  )
}

export default index
