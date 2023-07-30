import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react'
import Toast from 'react-native-toast-message';
import { api } from '~/utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { Box, Heading, Input, VStack, Text, Image, AspectRatio, Tooltip, Badge, Spinner } from 'native-base';
import { formatDistance } from 'date-fns';
import moment from 'moment'
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAtom } from 'jotai';
import { authState } from '../_layout';
import * as TaskManager from 'expo-task-manager';

TaskManager.defineTask("NOTIFICATION_SERVICE_ISSUE", ({ data, error }) => {

});

const SubItemIssues = () => {
  const { subItem } = useLocalSearchParams();
  const i = subItem?.toString();
  const { data: issue, error, isRefetching, refetch } = api.issues.getIssue.useQuery(i ? i : "")
  const router = useRouter()
  const [account] = useAtom(authState)
  const { mutate: resolveIssueMutate, isLoading, isSuccess } = api.admin.resolveIssue.useMutation()

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
  }, [issue, error])

  const resolveIssue = () => {
    if (account?.role !== 'admin') return Toast.show({
      type: "error",
      text1: "Access Denied",
      text2: "You do not have permission to resolve issues."
    })

    if (!issue) return;

    resolveIssueMutate({
      account: account.id,
      id: issue.id
    }, {
      onSuccess() {
        Toast.show({
          type: "success",
          text1: "Success!",
          text2: "Successfully resolved error!"
        })
      },
      onError(error) {
        Toast.show({
          type: 'error',
          text1: "Error",
          text2: error.message
        })
      }
    })
  }

  return (
    <SafeAreaView>
      <Stack.Screen options={{
        headerRight: () => (
          <>
            {issue && account?.role == 'admin' ? (
              <>
                {!isLoading && !isSuccess && issue.type !== 'resolved' ? (
                  <TouchableOpacity onPress={resolveIssue} accessibilityLabel="Resolve Issue?">
                    <Ionicons name="checkmark" size={25} color="red" />
                  </TouchableOpacity>
                ) : isLoading ? (
                  <Spinner size={25} accessibilityLabel="Loading.." />
                ) : isSuccess || issue.type == 'resolved' ? (
                  <Ionicons name="checkmark-done" size={25} color="green" />
                ) : null}
              </>
            ) : null}
          </>
        ), title: `${issue ? `${issue.type == 'review' ? "Unresolved -" : "Resolved -"} ${issue.title}` : "Loading..."}`
      }} />
      {!issue ? <ActivityIndicator size={30} color="gray" /> : (
        <ScrollView refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
          <Box className='px-12'>
            <TouchableOpacity onPress={() => router.push(`/assets/${issue.assetId}`)} className='mb-1'>
              <AspectRatio mb={3} w="100%" ratio={16 / 9}>
                <Image rounded="md" source={{
                  uri: issue.asset.images[0]?.url
                }} alt="image" />
              </AspectRatio>
              <Toast />
              <Text fontSize="xs" _light={{
                color: "violet.500"
              }} fontWeight="500" mt="-0.5">
                ITEM IN CONCERN: {issue.subItem.name} - {issue.asset.title}
              </Text>
            </TouchableOpacity>
            <Heading className='font-semibold' fontFamily="Cambria" mb="1">
              {issue.title}
            </Heading>
            <Text fontSize="sm" fontWeight={100} fontFamily="Inter">
              {issue.description}
            </Text>
            <Tooltip label={moment(issue.createdAt).local().format("hh:mm A - Do MMM YYYY")}>
              <Text fontSize="sm" mt={-0.5} color="gray.600" fontWeight={100} fontFamily="Inter">
                - Created {formatDistance(moment(issue.createdAt).local().toDate(), new Date(), {
                  addSuffix: true
                })}
              </Text>
            </Tooltip>
            <Text fontSize="sm" color="gray.600" mb="3" fontWeight={100} fontFamily="Inter">
              by
              <Text color="gray.800" fontFamily="Inter">
                {" "}{issue.user.name}
              </Text>
            </Text>
          </Box>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

export default SubItemIssues