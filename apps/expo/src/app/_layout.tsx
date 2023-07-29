import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack, Tabs, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from 'react-native'
import { useFonts } from 'expo-font';
import { TRPCProvider } from "~/utils/api";
import * as Animatable from 'react-native-animatable';
import { Drawer } from 'expo-router/drawer';
import Ionicons from '@expo/vector-icons/Ionicons';
import { atom, useAtom } from "jotai";
import { Container, Image, NativeBaseProvider } from "native-base";
import { User, Issue, Asset } from '@prisma/client'

type Auth = (User & {
  issues: (Issue & {
    asset: Asset;
  })[];
})
export const authState = atom<Auth | null>(null)
export const createIssueItem = atom<string | null>(null)

// This is the main layout of the app
// It wraps your pages with the providers they need
const RootLayout = () => {
  const [fontsLoaded] = useFonts({
    'Inter': require('../assets/Inter.ttf'),
    'Cambria': require('../assets/Cambria.ttf'),
  });
  const router = useRouter()
  const [account, setAccount] = useAtom(authState)

  return (
    <TRPCProvider>
      <SafeAreaProvider>
        <NativeBaseProvider>
          {/*
          The Stack component displays the current page.
          It also allows you to configure your screens 
        */}
          {fontsLoaded ? (
            <>
              <Stack
                screenOptions={{
                  headerTitle(props) {
                    return (
                      <Container className="flex flex-row">
                        <Image alt="logo" className="-ml-4 mr-4 self-center" width={8} height={8} source={require('../assets/icon.png')} />
                        <Text className="self-center w-full" style={{
                          fontFamily: "Inter",
                          fontSize: 15
                        }}>{props.children}</Text>
                      </Container>
                    )
                  },
                }}
              />
              <StatusBar />
            </>
          ) : <></>}
        </NativeBaseProvider>
      </SafeAreaProvider>
    </TRPCProvider>
  );
};

export default RootLayout;
