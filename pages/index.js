import {
  Avatar,
  Box,
  Flex,
  Spacer,
  Text,
  useDisclosure,
}
  from '@chakra-ui/react'
import { SettingsIcon } from "@chakra-ui/icons"
import color from "../etc/colors"
import Head from 'next/head'
import React, { useEffect, useReducer } from 'react'
import app from "../utils/firebase"
import * as auth from "firebase/auth"
import * as firestore from "firebase/firestore"
import { db } from "../utils/db"

import ServerList from "../components/serverList"
import Login from "../components/login"
import Settings from "../components/settings"
import Main from "../components/main/index"

/**
 * initialization of User store
 * below are store's expected properties
 */
const UserContext = React.createContext()
let userInitialState = {
  name: "",
  email: "",
  createdAt: "",
  avatar: "",
  fullName: "",
  servers: []
}

function userReducer(state, action) {
  const Auth = auth.getAuth(app)
  switch (action.type) {
    case 'Login':
      (async () => {

        localStorage.setItem("user", JSON.stringify(action.data))
        localStorage.setItem("isLoggedIn", "true")

      })()

      return {
        uid: action.data.uid,
        name: action.data.name,
        email: action.data.email,
        createdAt: action.data.createdAt,
        avatar: action.data.avatar,
        fullName: action.data.fullName,
        servers: action.data.servers
      }
    case 'Logout':
      localStorage.setItem("user", "{}")
      localStorage.setItem("isLoggedIn", "false")
      return userInitialState
    case 'UpdateName':
      auth.updateProfile(Auth.currentUser, {
        displayName: action.data.fullName,
      })
      localStorage.setItem("user", JSON.stringify({ ...state, ...action.data }))
      return { ...state, ...action.data }
    case 'UpdateAvatar':
      auth.updateProfile(Auth.currentUser, {
        photoURL: action.data.avatar,
      })
      localStorage.setItem("user", JSON.stringify({ ...state, ...action.data }))
      return { ...state, ...action.data }
    case "SetTemporaryAvatar":
      return { ...state, avatar: action.data.avatar }
    default:
      throw new Error("Please provide valid reducer action")
  }
}

/**
 * initialization of App store
 * global state for storing tasks properties, server properties, and certain configuration
 * below are store's expected properties
 */
const AppContext = React.createContext()
let appInitialState = {
  tasks: [],
  servers: [],
  config: {
    isLoggedIn: false,
  }
}

function appReducer(state, action) {
  switch (action.type) {
    case 'AddTask':
      db.tasks.put(action.data.task)
      return { ...state, tasks: [...state.tasks, action.data.task] }
    case 'AddTasks':
      db.tasks.bulkPut(action.data.tasks)
      return { ...state, tasks: [...state.tasks, ...action.data.tasks] }
    case 'AddServer':
      const servTasks = action.data.server.tasks.map(task => {
        return task.id.split(" ").join("")
      })
      db.servers.put({ ...action.data.server, tasks: servTasks })
      return { ...state, servers: [...state.servers, action.data.server] }
    case 'AddServers':
      const serverWithoutTask = action.data.servers.map(server => {
        const servTasks = server.tasks.map(task => {
          return task.id.split(" ").join("")
        })
        return { ...server, tasks: servTasks }
      })
      db.servers.bulkPut(serverWithoutTask)
      return { ...state, servers: [...action.data.servers] }
    case 'LoadServers':
      return { ...state, servers: action.data.servers }
    case 'ChangeConfig':
      localStorage.setItem("app", JSON.stringify({ ...state, config: { ...state.config, ...action.data.config } }))
      return { ...state, config: { ...state.config, ...action.data.config } }
    default:
      throw new Error("Please provide valid reducer action")
  }
}

export { UserContext }
export { AppContext }

export default function Home() {
  const [userStore, dispatchUserStore] = useReducer(userReducer, userInitialState)
  const [appStore, dispatchAppStore] = useReducer(appReducer, appInitialState)
  useEffect(() => {
    try {
      db.servers.toArray().then(servers => {
        dispatchAppStore({ type: "LoadServers", data: { servers } })
      }).finally(() => {
        console.log("loaded server from indexed db")
      })
    } catch (e) {
      console.log(e)
      console.log("config's initial state not found")
    }
  }, [])
  useEffect(() => {
    if (appStore.config.isLoggedIn) {
      onLoginClose()
    }

  }, [appStore])
  useEffect(() => {
    try {
      const localUser = JSON.parse(localStorage.getItem("user"))
      dispatchUserStore({ type: "Login", data: localUser })
    } catch (e) {
      console.log("failed to load data from local storage")
    }
    const Auth = auth.getAuth(app)

    localStorage.getItem("isLoggedIn") === "true" && onLoginClose()
    Auth.onAuthStateChanged(user => {
      if (Auth.currentUser !== null) {

        (async () => {
          try {

            const Firestore = firestore.getFirestore(app)
            const document = firestore.doc(Firestore, "/users/" + Auth.currentUser.uid)
            const docData = (await firestore.getDoc(document)).data()
            if (docData) {
              docData.name &&
                dispatchUserStore({
                  type: "Login", data: {
                    uid: Auth.currentUser.uid,
                    name: docData.name,
                    email: Auth.currentUser.email,
                    createdAt: Auth.currentUser.metadata.creationTime,
                    avatar: Auth.currentUser.photoURL,
                    fullName: Auth.currentUser.displayName,
                    servers: docData.servers
                  }
                })
            }
          } catch (e) {

          }
        })()
      }
    })
  }, [])

  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isLoginOpen, onOpen: onLoginOpen, onClose: onLoginClose } = useDisclosure({ defaultIsOpen: true })
  return (
    <AppContext.Provider value={{ appStore, dispatchAppStore }}>
      <UserContext.Provider value={{ userStore, dispatchUserStore }}>
        <div>
          <Head>
            <title>Caffe</title>
            <meta name="description" content="Generated by create next app" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <main>
            <Flex sx={{ filter: isLoginOpen ? "blur(5px)" : "none" }} flexDirection={"row"} height="100vh">
              <Box bg={color.subBase} minW={"280px"} maxW={"300px"} flexGrow={1}>
                <Flex flexDirection={"row"} margin="40px 20px" alignItems="center">
                  <Avatar size="md" src={userStore.avatar} borderRadius={"15px"} />
                  <Box marginLeft={3}>
                    <Text fontSize={"18px"} color={color.rosewater}>{userStore.name}</Text>
                    <Text fontSize={"14px"} color={color.subtext}>Online</Text>
                  </Box>
                  <Spacer />
                  <SettingsIcon w={5} h={5} marginRight={"0"} cursor="pointer" color="#AAAAAA" onClick={onOpen} />
                </Flex>
                <ServerList />
              </Box>
              <Box bg={color.base} flexGrow={19}>
                <Main />
              </Box>
            </Flex>

            {/* Settings Modal */}
            <Settings
              isOpen={isOpen}
              onOpen={onOpen}
              onClose={onClose} />
            {/* Login Modal */}
            <Login
              isLoginOpen={isLoginOpen}
              onLoginClose={onLoginClose}
              onLoginOpen={onLoginOpen} />
          </main>
        </div>
      </UserContext.Provider>
    </AppContext.Provider>
  )
}
