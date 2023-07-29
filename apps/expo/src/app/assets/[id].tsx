import { Stack, useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router/src/hooks'
import React, { useEffect } from 'react'
import { api } from '~/utils/api';
import Toast from 'react-native-toast-message/lib';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { AspectRatio, Container, Heading, ScrollView, Text, Image, Box } from 'native-base';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import { formatDistance } from 'date-fns';
import moment from 'moment';
import formatNumberWithAbbreviation from '~/hooks/numberAbbreviation';

const Item = () => {
  const router = useRouter()
  // const {id} = router.setParams()
  const { id } = useLocalSearchParams();
  const i = id?.toString();
  const { data: item, error } = api.assets.getAsset.useQuery(i ? i : "");

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

  const itemsAndSubItems = (i: Exclude<typeof item, undefined>) => {
    const registeredQuantity = i.subItems.length;
    const mentionedQuantity = i.quantity;

    if (!mentionedQuantity) return formatNumberWithAbbreviation(registeredQuantity)

    return `${formatNumberWithAbbreviation(registeredQuantity)}/${mentionedQuantity}`
  }

  return (
    <SafeAreaView>
      <Stack.Screen options={{ title: `${item ? item.title : "Loading..."}` }} />

      {!item ? <ActivityIndicator size={30} color="gray" /> : (
        <ScrollView>
          <Container className='flex mx-auto justify-center mb-10'>
            <SwiperFlatList
              showPagination={false}
              data={item.images}
              className='rounded-xl'
              initialScrollIndex={0}
              renderItem={({ item }) => (
                <Box maxW="80" rounded="lg">
                  <AspectRatio w="100%" ratio={16 / 9}>
                    <Image source={{
                      uri: item.url,
                    }} alt="image" />
                  </AspectRatio>
                </Box>
              )}
            />
          </Container>

          <Container className="text-gray-600 body-font flex justify-center mx-auto">
            <Container className="container mx-auto flex justify-center">
              <Container className="justify-center flex flex-wrap flex-row -m-4 text-center w-full">

                <TouchableOpacity onPress={() => router.push(`/issues/assets/${item.id}`)} className="w-full">
                  <Heading fontFamily="Cambria" className="title-font font-medium sm:text-4xl text-3xl text-cyan-700 pt-4">2.7K</Heading>
                  <Text className='text-md' fontFamily="Inter">⚠ Unresolved/Active Issues</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push(`/itemsOfAsset/${item.id}`)} className="w-full pt-8">
                  <Heading fontFamily="Cambria" className="title-font font-medium sm:text-4xl text-3xl text-cyan-700">
                    {itemsAndSubItems(item)}
                  </Heading>
                  <Text className='text-md' fontFamily="Inter">ℹ Registered{item.quantity ? " and Mentioned " : " "}Quantity</Text>
                </TouchableOpacity>

                {item.dateModified && <Container className="w-full" pt={8}>
                  <Heading fontFamily="Cambria" className="title-font font-medium sm:text-4xl text-3xl text-cyan-700">
                    {formatDistance(moment(item.dateModified).local().toDate(), new Date())}
                  </Heading>
                  <Text className='text-md' fontFamily="Inter">Time since Last Update</Text>
                </Container>}

                <Container className="p-4 sm:w-1/4 w-1/2">
                </Container>
                <Container className="p-4 sm:w-1/4 w-1/2">
                </Container>
              </Container>
            </Container>
          </Container>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

export default Item