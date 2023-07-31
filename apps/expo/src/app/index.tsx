import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { api } from "~/utils/api";
import { useAtom } from "jotai";
import { authState } from "./_layout";
import { Center, Container, Heading, Text, Stack as NativeStack, Button, Modal, ScrollView, Input } from "native-base";
import Toast from 'react-native-toast-message/lib';
import * as SecureStore from 'expo-secure-store';

const Index = () => {
  // const utils = api.post.byId.
  const router = useRouter()
  const [account, setAccount] = useAtom(authState)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const { mutate, isLoading } = api.auth.getSession.useMutation()

  const checkAndExecute = async () => {
    if (account) return;

    let id = await SecureStore.getItemAsync("ACCOUNT_ID");
    let password = await SecureStore.getItemAsync("ACCOUNT_PASSWORD");

    if (id && password) {
      Toast.show({
        type: 'success',
        text1: "🔐 Automatically signing you in...",
        visibilityTime: 3000
      })

      mutate({
        id,
        password
      }, {
        async onSuccess(data) {
          setAccount(data);

          await SecureStore.setItemAsync("ACCOUNT_ID", data.id)
          await SecureStore.setItemAsync("ACCOUNT_PASSWORD", data.password)

          setModalVisible(false)

          Toast.show({
            type: "success",
            text1: `Welcome back ${data.name}`,
            text2: `You have successfully logged in!`,
          })
        },
        onError(error) {
          setModalVisible(false)

          Toast.show({
            type: "success",
            text1: `Error`,
            text2: `${error.message}`,
          })
        }
      })
    } else {
      return;
    }
  }

  useEffect(() => {
    checkAndExecute()
  }, [])

  // inputs
  const [email, setEmail] = useState<string>()
  const [password, setPassword] = useState<string>()

  const login = () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Form Error',
        text2: 'Fill in all the required fields',
        visibilityTime: 3000
      })

      setModalVisible(false)

      return;
    }

    mutate({
      email,
      password
    }, {
      async onSuccess(data) {
        setAccount(data);

        await SecureStore.setItemAsync("ACCOUNT_ID", data.id)
        await SecureStore.setItemAsync("ACCOUNT_PASSWORD", data.password)

        setModalVisible(false)

        Toast.show({
          type: "success",
          text1: `Welcome back ${data.name}`,
          text2: `You have successfully logged in!`,
        })
      },
      onError(error) {
        setModalVisible(false)

        Toast.show({
          type: "success",
          text1: `Error`,
          text2: `${error.message}`,
        })
      }
    })
  }

  const logout = async () => {
    setAccount(null)

    await SecureStore.deleteItemAsync("ACCOUNT_ID")
    await SecureStore.deleteItemAsync("ACCOUNT_PASSWORD")

    Toast.show({
      type: "success",
      text1: `Signed out`,
      text2: `Successfully logged you out...`,
    })
  }

  return (
    <SafeAreaView>
      {/* Changes page title visible on the header */}
      <Stack.Screen options={{ title: "Home" }} />

      <Center className="-mt-4">
        <Container>
          <Text className="mb-2.5">
            Welcome to {"\n"}

            <Text color="gray.600" style={{
              fontFamily: "Cambria",
              fontWeight: "600",
              fontSize: 20
            }}>AssetWing - Management Service!</Text>
          </Text>

          <Text fontWeight="medium" fontFamily="Inter">
            <Text color="emerald.600" className="leading-loose" fontFamily="Cambria" fontSize={16}>Streamline, Organize, Succeed</Text>{"\n"}
            {!account ? "Elevate Your School's Assets with Our App!" : `Welcome back ${account.name}!`}
          </Text>

          <NativeStack mb="1" mt="5" direction={{
            base: "row",
            md: "row"
          }} mx={{
            base: "auto",
            md: "0"
          }}>
            {!account && <Button isLoading={isLoading} isLoadingText={isLoading ? "Logging you in..." : undefined} onPress={() => setModalVisible(true)} size="sm" variant="subtle" colorScheme="darkBlue">
              <Text fontFamily="Inter" fontSize={12}>🔐 Login Now</Text>
            </Button>}
            {account && <Button onPress={() => router.push("/issues")} size="sm" className="w-1/2" variant="outline" colorScheme="darkBlue">
              <Text fontFamily="Inter" fontSize={12}>⚠ All Issues</Text>
            </Button>}
            <Button onPress={() => router.push("/assets")} size="sm" variant="subtle" className="w-1/2" colorScheme="secondary">
              <Text fontFamily="Inter" fontSize={12}>📚 All Assets</Text>
            </Button>
          </NativeStack>
          {account && <NativeStack mt="2" direction={{
            base: "row",
            md: "row"
          }} space={2} mx={{
            base: "auto",
            md: "0"
          }}>
            <Button onPress={logout} className="w-full" size="sm" variant="subtle" colorScheme="rose">
              <Text fontFamily="Inter" fontSize={12}>🚪 Logout</Text>
            </Button>
          </NativeStack>}
          {account?.role == 'admin' && <NativeStack mt="2" direction={{
            base: "row",
            md: "row"
          }} space={2} mx={{
            base: "auto",
            md: "0"
          }}>
            <Button onPress={() => router.push('/admin')} className="w-full bg-red-300" size="sm">
              <Text fontFamily="Inter" fontSize={12}>🛡️ YOUR ADMIN PANEL</Text>
            </Button>
          </NativeStack>}
        </Container>
      </Center>

      <Toast />

      <Modal isOpen={modalVisible} onClose={setModalVisible} size="md">
        <Modal.Content maxH="540">
          <Modal.CloseButton />
          <Modal.Header fontFamily="Cambria">LOGIN</Modal.Header>
          <Modal.Body>
            <ScrollView>
              <Text fontFamily="Inter" mb={2}>📧 Email</Text>
              <Input autoComplete="email" autoCapitalize="none" size="sm" placeholder="Enter..." onChangeText={(text) => setEmail(text)} />

              <Text fontFamily="Inter" mt={5} mb={2}>🔑 Password</Text>
              <Input autoCapitalize="none" size="sm" type="password" placeholder="Enter..." onChangeText={(text) => setPassword(text)} />
            </ScrollView>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={() => {
                setModalVisible(false);
              }}>
                Cancel
              </Button>
              <Button variant="outline" isLoading={isLoading} isLoadingText={isLoading ? "Please wait..." : undefined} onPress={login}>
                🔓 Login
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </SafeAreaView >
  );
};

export default Index;