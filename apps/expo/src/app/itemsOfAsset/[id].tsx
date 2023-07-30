import React, { useEffect } from 'react'
import { api } from "~/utils/api";
import { formatDistance } from 'date-fns'
import moment from 'moment'
import Toast from 'react-native-toast-message';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const ItemsOfAsset = () => {
  const { id } = useLocalSearchParams();
  const i = id?.toString();
  const { data: item, error } = api.assets.getAsset.useQuery(i ? i : "");

  const router = useRouter()

  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `${error.message}`,
      })

      setTimeout(() => {
        router.push("/")
      }, 3000);
    }
  }, [item, error])

  if (error) return (
    <Toast />
  )

  return (
    <SafeAreaView>
      <Stack.Screen options={{ title: `${item ? `Registered Items - ${item.title}` : "Loading..."}` }} />


    </SafeAreaView>
  )
}

export default ItemsOfAsset