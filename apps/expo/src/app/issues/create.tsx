import { Stack, useRouter } from 'expo-router'
import { useAtom } from 'jotai'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, RefreshControl } from 'react-native'
import { Button, CheckIcon, FormControl, Input, Stack as NativeStack, Select, TextArea, WarningOutlineIcon, Text, ScrollView } from 'native-base'
import { authState, createIssueItem } from '../_layout'
import { api } from '~/utils/api'
import Toast from 'react-native-toast-message'
import { SafeAreaView } from 'react-native-safe-area-context'

const CreateIssue = () => {
  const [account, setAccount] = useAtom(authState)
  const [item] = useAtom(createIssueItem)
  const [asset, setAsset] = useState(item)
  const { data: assetData, error } = api.assets.getAsset.useQuery(asset);
  const { data: assetsWithSubItem, error: error2 } = api.assets.getAssets.useQuery();
  const router = useRouter()
  const { mutate, isLoading } = api.issues.new.useMutation();

  // Inputs
  const [title, setTitle] = useState<string>()
  const [description, setDescription] = useState<string>()
  const [selected, setSelected] = useState<string | undefined>(asset ? asset : undefined)
  const [selectedSubItem, setSelectedSubItem] = useState<string | undefined>()

  useEffect(() => {
    if (error2) {
      Toast.show({
        text1: "Error",
        text2: error?.message || error2?.message
      })
    }
  }, [error2])

  if ((asset && !assetData) || !assetsWithSubItem) return (
    <SafeAreaView>
      <Stack.Screen options={{ title: `Loading...` }} />
      <ActivityIndicator size={30} color="gray" />
    </SafeAreaView>
  )

  const subItemsForSelected = (assetsWithSubItem.flatMap((a) => a.subItems)).filter((s) => s.assetId == selected)

  const create = () => {
    if (!selected || !selectedSubItem || !title || !description) return Toast.show({
      type: 'error',
      text1: "Improper Inputs",
      text2: "Please enter all the inputs correctly"
    })

    if (!account) {
      Toast.show({
        type: 'error',
        text1: "Authentication Error",
        text2: "Please re-authenticate yourself."
      })

      setTimeout(() => {
        router.push('/')
      }, 3200);

      return;
    }

    mutate({
      asset: selected,
      description,
      title,
      subItem: selectedSubItem,
      user: account.id
    }, {
      onSuccess(data) {
        Toast.show({
          type: 'success',
          text1: "Successfully raised Issue!",
          text2: "You can now check/track for issues under 'Issues' tab.",
        })

        setTimeout(() => {
          router.push("/issues")
        }, 3000);
      },
      onError(error) {
        Toast.show({
          type: 'error',
          text1: "Error",
          text2: error.message,
        })

        setTimeout(() => {
          router.push("/")
        }, 3000);
      }
    })
  }

  return (
    <SafeAreaView>
      <Stack.Screen options={{ title: `⚠ ${assetData ? assetData.title : "Report Issue"}` }} />

      <ScrollView refreshControl={<RefreshControl refreshing={isLoading} />}>
        <NativeStack px={8}>
          <FormControl.Label>Title of Issue</FormControl.Label>
          <Input onChangeText={(text) => setTitle(text)} variant="outline" placeholder="Enter..." />

          <FormControl.Label mt={4}>Nature/Description of Issue</FormControl.Label>
          <TextArea onChangeText={(text) => setDescription(text)} autoCompleteType="disabled" variant="outline" placeholder="Enter" />

          <FormControl.Label mt={4}>Asset</FormControl.Label>
          <Select selectedValue={selected} minWidth="200" accessibilityLabel="Choose Service" placeholder="Choose Asset" _selectedItem={{
            bg: "teal.600",
            endIcon: <CheckIcon size="5" />
          }} onValueChange={itemValue => setSelected(itemValue)}>
            {assetsWithSubItem.map((a, i) => <Select.Item key={i} label={`${a.title}`} value={a.id} />)}
          </Select>

          {selected && (
            <>
              <FormControl.Label mt={4}>Sub Item</FormControl.Label>
              <Select minWidth="200" accessibilityLabel="Choose Service" placeholder="Choose Sub Item" _selectedItem={{
                bg: "teal.600",
                endIcon: <CheckIcon size="5" />
              }} onValueChange={itemValue => setSelectedSubItem(itemValue)}>
                {subItemsForSelected.map((a, i) => <Select.Item key={i} label={`${a.name}`} value={a.id} />)}
                {!subItemsForSelected.length ? <Select.Item label='No Sub-Items Registered for Selected Asset' isDisabled value='' /> : null}
              </Select>
            </>
          )}

          <Button onPress={create} mt={6} isLoading={isLoading} isLoadingText="Submitting Issue...">
            <Text fontFamily="Inter" color="white">⚠ Raise Issue</Text>
          </Button>
        </NativeStack>
      </ScrollView>

      <Toast />
    </SafeAreaView>
  )
}

export default CreateIssue