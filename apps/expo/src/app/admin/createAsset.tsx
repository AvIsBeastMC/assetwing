import { useAtom } from 'jotai'
import React, { useState } from 'react'
import { authState } from '../_layout'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useRouter } from 'expo-router'
import { RefreshControl, TouchableOpacity } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import { Button, CheckIcon, FormControl, Input, Stack as NativeStack, Select, TextArea, WarningOutlineIcon, Text, ScrollView, Center, Modal } from 'native-base'
import * as ImagePicker from 'expo-image-picker';
import { api } from '~/utils/api'
import Toast from 'react-native-toast-message'

const createAsset = () => {
  const [account] = useAtom(authState)
  const router = useRouter()
  const [title, setTitle] = useState<string>()
  const [description, setDescription] = useState<string>()
  const [mentionedQuantity, setMentionedQuantity] = useState<number>()
  const [imageUrl, setImageUrl] = useState<string>()
  const { mutate: createAssetMutate, isLoading } = api.admin.createAsset.useMutation()
  const [showModal, setShowModal] = useState<string>()

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true
    });

    console.log(result);

    if (!result.canceled) {
      // result.assets.map((a) => a.base64)
    }
  };

  const create = () => {
    if (!title || !description || !mentionedQuantity) return Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Please enter all of the fields correctly.'
    });

    if (account?.role !== 'admin') return;

    createAssetMutate({
      account: account.id,
      description,
      title,
      mentionedQuantity
    }, {
      onSuccess(data) {
        setShowModal(data.id)
      },
      onError(data) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data.message
        })
      }
    })
  }

  return (
    <SafeAreaView>
      <Stack.Screen options={{
        headerRight: () => (
          <>
            <TouchableOpacity onPress={() => router.push(`/admin/createSubItem/none`)}>
              <Ionicons name="add-circle" size={30} />
            </TouchableOpacity>
          </>
        ),
        title: "Create Asset (group of items) - Admin Panel"
      }} />

      <ScrollView refreshControl={<RefreshControl refreshing={isLoading} />}>
        <NativeStack px={8}>
          <FormControl.Label>Name</FormControl.Label>
          <Input onChangeText={(text) => setTitle(text)} variant="outline" placeholder="Enter..." />

          <FormControl.Label mt={4}>Description</FormControl.Label>
          <TextArea onChangeText={(text) => setDescription(text)} autoCompleteType="disabled" variant="outline" placeholder="Enter" />
          <Toast />
          <FormControl.Label mt={4}>Mentioned Quantity</FormControl.Label>
          <Text fontSize={10} mt={-1.4} mb={1.5}>(raw number of items, you will have to register the items later)</Text>
          <Input onChangeText={(text) => setMentionedQuantity(parseInt(text))} keyboardType="number-pad" variant="outline" placeholder="Enter" />

          {!isLoading && (
            <Button onPress={pickImage} mt={6} leftIcon={<Ionicons name="cloud-upload-outline" color="white" size={15} />}>
              Upload Images (optional)
            </Button>
          )}

          <Button onPress={create} isLoading={isLoading} mt={2} isLoadingText="Creating Asset..." leftIcon={<Ionicons name="add-circle" size={15} color="white" />}>
            <Text fontFamily="Inter" color="white">Create Asset</Text>
          </Button>
        </NativeStack>
      </ScrollView>

      <Modal isOpen={showModal ? true : false} onClose={() => setShowModal(undefined)}>
        <Modal.Content maxWidth="350" maxH="212">
          <Modal.CloseButton />
          <Modal.Header fontFamily="Inter">Success!</Modal.Header>
          <Modal.Body>
            Would you like to add Sub-Items for the Created Asset?
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button onPress={() => {
                router.push(`/admin/createSubItem/${showModal}`)
              }}>
                Yes
              </Button>
              <Button variant="ghost" colorScheme="blue" onPress={() => {
                setShowModal(undefined);
              }}>
                No
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </SafeAreaView>
  )
}

export default createAsset