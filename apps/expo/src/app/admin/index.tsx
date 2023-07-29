import { Stack, useRouter } from 'expo-router'
import { useAtom } from 'jotai'
import { Center, Container, Heading, ScrollView, Text } from 'native-base'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { authState } from '../_layout'
import { ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native'
import { api } from '~/utils/api'
import Toast from 'react-native-toast-message'
import formatNumberWithAbbreviation from '~/hooks/numberAbbreviation'

const Admin = () => {
  const [account, setAccount] = useAtom(authState)
  const router = useRouter()
  const { data: overview, error, refetch, isRefetching } = api.admin.overview.useQuery({
    id: account ? account.id : "",
    password: account ? account.password : ""
  }, {
    refetchInterval: 30000
  });

  useEffect(() => {
    if (account?.role !== 'admin') {
      return router.push("/")
    }

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
  }, [overview, error])

  if (error) return (
    <Toast />
  )

  if (account?.role !== 'admin') return <></>

  return (
    <SafeAreaView>
      <Stack.Screen options={{ title: `${!overview ? "Loading Admin Panel..." : "Admin Panel"}` }} />

      {!overview ? <ActivityIndicator size={30} color="gray" /> : (
        <ScrollView refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
          <Container className="text-gray-600 body-font flex justify-center mx-auto">
            <Container className="container mx-auto flex justify-center">
              <Container className="justify-center flex flex-wrap flex-row -m-4 text-center w-full">

                <TouchableOpacity onPress={() => router.push("/issues")} className="w-full">
                  <Heading fontFamily="Cambria" className="title-font font-medium sm:text-4xl text-3xl text-cyan-700 pt-4">{formatNumberWithAbbreviation(overview.issues)}</Heading>
                  <Text className='text-md' fontFamily="Inter">{overview.issues > 0 ? "⚠" : "✅"} Manage Unresolved/Active Issues</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/assets")} className="w-full pt-8">
                  <Heading fontFamily="Cambria" className="title-font font-medium sm:text-4xl text-3xl text-cyan-700 pt-4">{formatNumberWithAbbreviation(overview.assets)}</Heading>
                  <Text className='text-md' fontFamily="Inter">📚 Manage Assets/Sub-Items Data</Text>
                </TouchableOpacity>

                <TouchableOpacity>

                </TouchableOpacity>
              </Container>
            </Container>
          </Container>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

export default Admin