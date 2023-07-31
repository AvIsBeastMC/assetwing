import { useAtom } from 'jotai'
import React, { useEffect, useState } from 'react'
import { authState } from '../../_layout'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '~/utils/api'
import Toast from 'react-native-toast-message'
import { ScrollView } from 'react-native'
import { Button, FormControl, Input, Stack as NativeStack, TextArea, Text, Select, CheckIcon } from 'native-base'

const createSubItem = () => {
  const [account] = useAtom(authState)
  const router = useRouter()
  const { assetId } = useLocalSearchParams();
  const assetIdGiven = assetId == 'none' ? undefined : assetId?.toString()
  const { data: assets, error, isSuccess, isLoading } = api.assets.getAssets.useQuery()
  const { mutate: createSubItemMutate, isLoading: isCreating } = api.admin.createSubItem.useMutation()

  // Inputs
  const [name, setName] = useState<string>()
  const [additionalInformation, setAdditionalInformation] = useState<string>()
  const [asset, setAsset] = useState<string | undefined>(assetIdGiven)

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
  }, [assets, error])

  if (error) return (
    <Toast />
  )

  const createSubItem = () => {
    if (!name || !additionalInformation || !asset) return Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Please enter all the details correctly'
    })

    if (!account || account.role !== 'admin') return;

    createSubItemMutate({
      account: account.id,
      additionalInformation,
      name,
      asset
    }, {
      onSuccess(data) {
        Toast.show({
          type: "success",
          text2: 'Successfully created sub item!',
          text1: 'Success'
        });

        setTimeout(() => {
          // router.push('/')
        }, 3000);
      },
      onError(error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message
        })
      }
    })
  }

  return (
    <SafeAreaView>
      <Stack.Screen options={{
        title: `Create Sub Item`
      }} />

      {!assets ? <ActivityIndicator size={30} color="gray" /> : (
        <ScrollView refreshControl={<RefreshControl refreshing={isLoading || isCreating} />}>
          <NativeStack px={8}>
            <FormControl.Label>Name</FormControl.Label>
            <Input onChangeText={(text) => setName(text)} variant="outline" placeholder="Enter..." />

            <FormControl.Label mt={4}>Additional Information (optional)</FormControl.Label>
            <TextArea onChangeText={(text) => setAdditionalInformation(text)} autoCompleteType="disabled" variant="outline" placeholder="Enter" />

            <Toast />

            <FormControl.Label mt={4}>Asset</FormControl.Label>
            <Select selectedValue={asset} minWidth="200" accessibilityLabel="Choose Service" placeholder="Choose Asset" _selectedItem={{
              bg: "teal.600",
              endIcon: <CheckIcon size="5" />
            }} onValueChange={itemValue => setAsset(itemValue)}>
              {assets.map((a, i) => <Select.Item key={i} label={`${a.title}`} value={a.id} />)}
            </Select>

            <Button onPress={createSubItem} isLoading={isLoading || isCreating} mt={4} isLoadingText="Creating Asset..." leftIcon={<Ionicons name="add-circle" size={15} color="white" />}>
              <Text fontFamily="Inter" color="white">Create Sub-item</Text>
            </Button>
          </NativeStack>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

export default createSubItem