import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from "react";
import Toast from 'react-native-toast-message/lib';
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "~/utils/api";
import { ActivityIndicator, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { AspectRatio, Box, Button, Center, Input, VStack, Stack as NativeStack, Image, Text, HStack, Heading, Actionsheet, Badge, Spinner, Modal } from 'native-base';
import { formatDistance } from 'date-fns';
import moment from 'moment';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAtom } from 'jotai';
import { truncateString } from '~/hooks/truncate';
import { useToast } from 'native-base';
import { authState, createIssueItem } from '~/app/_layout';

const Issues = () => {
  const { id } = useLocalSearchParams();
  const i = id?.toString();
  const router = useRouter()
  const { data, error, isRefetching, refetch } = api.assets.getIssuesOfAsset.useQuery(i ? i : '')
  const [, setEditItem] = useAtom(createIssueItem)
  const [account] = useAtom(authState)

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
  }, [data, error])

  if (error) return (
    <Toast />
  )

  if (!data) return (
    <>
      <Stack.Screen options={{ title: 'Loading...' }} />
      <Spinner size={25} />
    </>
  )

  const { issues, asset } = data;

  const IssueComponent = ({ i, keyI }: { keyI: number, i: Exclude<typeof issues, undefined>[number] }) => {
    const [open, setOpen] = useState<boolean>(false);
    const a = i.asset
    const issueId = i.id;
    const { mutate: deleteIssueMutate, isLoading } = api.admin.deleteIssue.useMutation()
    const toast = useToast();
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const { mutate: updateIssueMutate, isLoading: updatingIssue } = api.admin.updateIssue.useMutation()

    // Inputs
    const [title, setTitle] = useState<string>(i.title)
    const [description, setDescription] = useState<string>(i.description)

    const deleteIssue = () => {
      if (!account) return;

      deleteIssueMutate({
        id: issueId,
        account: account?.id
      }, {
        onSuccess() {
          toast.show({
            description: "Successfully deleted Issue!"
          })

          setTimeout(() => {
            refetch()
          }, 2000);
        },
        onError(error) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: error.message
          })
        },
      })
    }

    const issueUpdate = () => {
      if (!title || !description) return Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Enter all of the fields carefully.'
      })

      if (account?.role !== 'admin') return;

      updateIssueMutate({
        account: account.id,
        description,
        title,
        id: i.id
      }, {
        onSuccess(data) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Updated issue...'
          })

          setTimeout(() => {
            refetch()
          }, 2000);
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
      <>
        <TouchableOpacity className={`${keyI > 0 ? "my-4" : ""}`} onLongPress={() => setOpen(true)} onPress={() => router.push(`/issues/${issueId}`)} style={{
          alignItems: "center"
        }}>
          <Box maxW="80" rounded="lg" overflow="hidden" borderColor="coolGray.200" borderWidth="1" _dark={{
            borderColor: "coolGray.600",
            backgroundColor: "gray.700"
          }} _web={{
            shadow: 2,
            borderWidth: 0
          }} _light={{
            backgroundColor: "gray.50"
          }}>
            <Box>
              <AspectRatio w="100%" ratio={16 / 9}>
                <Image source={{
                  uri: a.images[0]?.url
                }} alt="image" />
              </AspectRatio>
              <Center bg={i.type == 'review' ? "red.600" : "yellow.600"} _text={{
                color: "warmGray.50",
                fontWeight: "700",
                fontSize: "xs"
              }} position="absolute" bottom="0" px="3" py="1.5">
                {i.type == 'review' ? "Under Review" : "Resolved!"}
              </Center>
            </Box>
            <NativeStack p="4" space={3}>
              <NativeStack space={2}>
                <Heading className='flex flex-start' size="md" ml={-0.5}>
                  {i.title}
                </Heading>
              </NativeStack>

              {i.updatedAt && (
                <Text fontSize="xs" _light={{
                  color: "violet.500"
                }} fontWeight="500" ml="-0.5" mt="-2">
                  {i.updatedAt && `Updated ${formatDistance(moment(a.dateModified).local().toDate(), new Date(), {
                    addSuffix: true
                  })}`}
                </Text>
              )}

              <Text fontWeight="400">
                {truncateString(i.description)}
              </Text>

              <HStack alignItems="center" mt={-3.5} space={4} justifyContent="space-between">
                <HStack alignItems="center">
                  <Text color="coolGray.600" _dark={{
                    color: "warmGray.200"
                  }} fontWeight="400">
                    {a.title} ({i.subItem.name})
                  </Text>
                </HStack>
              </HStack>
            </NativeStack>
          </Box>

          <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
            <Actionsheet.Content>
              <Actionsheet.Item startIcon={<Ionicons name="link" size={24} color="black" />} fontFamily="Inter">View Sub-Item</Actionsheet.Item>

              <Actionsheet.Item startIcon={<Ionicons name="link" size={24} color="black" />} fontFamily="Inter">View Asset Information</Actionsheet.Item>

              <Actionsheet.Item onPress={() => {
                setOpen(false)
                setModalVisible(true)
              }} startIcon={<Ionicons name="pencil-outline" size={24} color="black" />} fontFamily="Inter" isDisabled={account?.role !== 'admin'}>
                <Text className='text-red-500 uppercase'>
                  Update Issue Data
                </Text>
              </Actionsheet.Item>

              <Actionsheet.Item onPress={deleteIssue} startIcon={<Ionicons name="warning" size={24} color="black" />} fontFamily="Inter" isDisabled={account?.role !== 'admin'}>
                {!isLoading ? (
                  <Text className='text-red-500 uppercase'>
                    Delete Issue
                  </Text>
                ) : (
                  <Spinner size={25} />
                )}
              </Actionsheet.Item>
            </Actionsheet.Content>
          </Actionsheet>
        </TouchableOpacity>

        <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)} size="md">
          <Modal.Content maxH="540">
            <Modal.CloseButton />
            <Modal.Header fontFamily="Cambria">Update Issue Data</Modal.Header>
            <Modal.Body>
              <ScrollView>
                <Text fontFamily="Inter" mb={2}>Title</Text>
                <Input autoComplete="email" defaultValue={i.title} autoCapitalize="none" size="sm" placeholder="Enter..." onChangeText={(text) => setTitle(text)} />

                <Text fontFamily="Inter" mt={5} mb={2}>Description</Text>
                <Input autoCapitalize="none" defaultValue={i.description} size="sm" placeholder="Enter..." onChangeText={(text) => setDescription(text)} />
              </ScrollView>
            </Modal.Body>
            <Modal.Footer>
              <Button.Group space={2}>
                <Button variant="ghost" colorScheme="blueGray" onPress={() => {
                  setModalVisible(false);
                }}>
                  Cancel
                </Button>
                <Button variant="outline" isLoading={isLoading || updatingIssue} isLoadingText={isLoading ? "Please wait..." : undefined} onPress={issueUpdate}>
                  🖋 Make the Changes
                </Button>
              </Button.Group>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </>
    )
  }

  return (
    <SafeAreaView>
      <Stack.Screen options={{
        title: `⚠ ${asset.title}`, headerRight: () => (
          <TouchableOpacity onPress={() => {
            setEditItem(asset.id)
            router.push("/issues/create")
          }}>
            <Ionicons name="add" size={30} />
          </TouchableOpacity>
        )
      }} />

      {!issues ? <ActivityIndicator size={30} color="gray" /> : (
        <ScrollView refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
          {issues.map((a, i) => (
            <IssueComponent keyI={i} key={i} i={a} />
          ))}
          {!issues.length && <Text fontFamily="Cambria" className='text-center text-md'>❌ No Issues Found...</Text>}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

export default Issues