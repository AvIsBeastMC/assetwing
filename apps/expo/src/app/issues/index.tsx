import { Stack, useRouter } from 'expo-router'
import React, { useEffect, useState } from "react";
import Toast from 'react-native-toast-message/lib';
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "~/utils/api";
import { ActivityIndicator, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { AspectRatio, Box, Button, Center, Input, VStack, Stack as NativeStack, Image, Text, HStack, Heading, Actionsheet } from 'native-base';
import { formatDistance } from 'date-fns';
import moment from 'moment';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAtom } from 'jotai';
import { createIssueItem } from '../_layout';
import { truncateString } from '~/hooks/truncate';

const Issues = () => {
  const router = useRouter()
  const { data: issues, error, isRefetching, refetch } = api.issues.getAllIssues.useQuery()
  const [search, setSearch] = useState<string>("")
  const [, setEditItem] = useAtom(createIssueItem)

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
  }, [issues, error])

  if (error) return (
    <Toast />
  )

  const searchThroughIssues = issues ? issues.filter((i) => i.title.includes(search)) : []

  const IssueComponent = ({ i, keyI }: { keyI: number, i: Exclude<typeof searchThroughIssues, undefined>[number] }) => {
    const [open, setOpen] = useState<boolean>(false);
    const a = i.asset

    return (
      <TouchableOpacity className={`${keyI > 0 ? "my-4" : ""}`} onLongPress={() => setOpen(true)} onPress={() => router.push(`/assets/${a.id}`)} style={{
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
            <Center bg="violet.500" _dark={{
              bg: "violet.400"
            }} _text={{
              color: "warmGray.50",
              fontWeight: "700",
              fontSize: "xs"
            }} position="absolute" bottom="0" px="3" py="1.5">
              PHOTOS
            </Center>
          </Box>
          <NativeStack p="4" space={3}>
            <Text fontSize="xs" _light={{
              color: "violet.500"
            }} fontWeight="500" ml="-0.5" mb="-2.5">
              Created by <Text bold>{i.user.name}</Text>
            </Text>

            <NativeStack space={2}>
              <Heading size="md" ml={-0.5}>
                {i.title}
              </Heading>
            </NativeStack>

            {i.updatedAt && (
              <Text fontSize="xs" _light={{
                color: "violet.500"
              }} fontWeight="500" ml="-0.5" mt="-2">
                {a.dateModified && `Updated ${formatDistance(moment(a.dateModified).local().toDate(), new Date(), {
                  addSuffix: true
                })}`}
              </Text>
            )}

            <Text fontWeight="400">
              {truncateString(i.description)}
            </Text>

            <HStack alignItems="center" mt={-2.4} space={4} justifyContent="space-between">
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
            <Actionsheet.Item startIcon={<Ionicons name="share" size={24} color="black" />} isDisabled>Share Link // feature under works</Actionsheet.Item>
            <Actionsheet.Item onPress={() => {
              router.push("/issues/create")
            }} startIcon={<Ionicons name="warning" size={24} color="black" />} fontFamily="Inter">Raise an Issue for Sub-Item</Actionsheet.Item>
            <Actionsheet.Item startIcon={<Ionicons name="link" size={24} color="black" />} fontFamily="Inter">View Issues</Actionsheet.Item>
            <Actionsheet.Item startIcon={<Ionicons name="link" size={24} color="black" />} fontFamily="Inter">View Sub-Items</Actionsheet.Item>
            {/* <Actionsheet.Item>Cancel</Actionsheet.Item> */}
          </Actionsheet.Content>
        </Actionsheet>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView>
      <Stack.Screen options={{
        title: !issues ? "Loading..." : `⚠ Issues`, headerRight: () => (
          <TouchableOpacity onPress={() => {
            setEditItem(null)
            router.push("/issues/create")
          }}>
            <Ionicons name="add" size={30} />
          </TouchableOpacity>
        )
      }} />

      {!issues ? <ActivityIndicator size={30} color="gray" /> : (
        <ScrollView refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
          <VStack mb={4} maxW="80" rounded="lg" className='flex mx-auto justify-center' alignSelf="center">
            <Input onTextInput={() => {
              setTimeout(() => {
                !searchThroughIssues.length ? refetch() : null
              }, 2000);
            }} onChangeText={(search) => setSearch(search)} placeholder="Search through Assets and Hit Done/Enter on Keyboard!" width="100%" borderRadius="4" fontSize="14" size="8" color="gray.400" onSubmitEditing={() => alert('asd')} />
          </VStack>
          {searchThroughIssues.map((a, i) => (
            <IssueComponent keyI={i} key={i} i={a} />
          ))}
          {!searchThroughIssues.length && <Text fontFamily="Cambria" className='text-center text-md'>❌ No Issues Found...</Text>}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

export default Issues