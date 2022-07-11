import {
  Box,
  Flex,
  Avatar,
  Collapse,
  Select,
  Text,
  Spacer,
  Badge,
  Icon,
  useDisclosure,
  Center,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from "@chakra-ui/react"
import { MdTask } from "react-icons/md"
import { AiOutlineMinus } from "react-icons/ai"
import { FaHashtag, FaMap, FaAngleDown } from "react-icons/fa"
import { Timestamp } from "firebase/firestore"
import { UserContext } from "../pages"
import React, { useEffect, useContext, useState, createContext } from "react"
import * as firestore from "firebase/firestore"
import * as auth from "firebase/auth"
import app from "../utils/firebase"

interface ActiveServer{
  active: Array<number>,
  setActive: (id:Array<number>) => void
}
const ActiveServer = createContext<ActiveServer | null>(null)
interface Server {
  name: string,
  icon: string,
  admins: string[],
  category: string,
  githubCommits: string[],
  lastActivity: string,
  lastActivityTime: Timestamp,
  members: string[],
  tasks: string[]
}

export { ActiveServer }

export default function ServerList() {
  const { userStore, dispatchUserStore } = useContext(UserContext)
  const [activeServer, setActiveServer] = useState<Array<number>>([0, 0])
  const [servers, setServers] = useState<Array<Server>>([])
  const [categories, setCategories] = useState<Array<string>>([])
  useEffect(() => {
    try {
      const Auth: auth.Auth = auth.getAuth(app)
      if (Auth.currentUser) {
        const Firestore: firestore.Firestore = firestore.getFirestore(app)
        const returnedServers: Array<Server> = []
        new Promise<void>((resolve, reject) => {
          userStore.servers.map((server, id) => {
            (async () => {
              server = server.split(" ").join("")
              const document: firestore.DocumentReference = firestore.doc(Firestore, "/server/" + server)
              const docData: firestore.DocumentData | undefined = (await firestore.getDoc(document)).data()
              if (docData) {
                returnedServers.push(docData as Server)
              }
              if (id === userStore.servers.length - 1) {
                resolve()
              }
            })().then(() => {

            }).catch(e => {
              console.log(e)
            })
          })
        }).then(() => {
          let tmpCategories: Array<string> = []
          returnedServers.forEach((server, id) => {
            tmpCategories.indexOf(server.category) === -1 && tmpCategories.push(server.category)
          })
          returnedServers.sort((a, b) => {
            return a.lastActivityTime.toDate().getTime() - b.lastActivityTime.toDate().getTime()
          })
          setCategories(tmpCategories)
          setServers(returnedServers)
        })
      }
    }
    catch (e) {
      console.log(e)
    }
  }, [userStore])
  return (
    <ActiveServer.Provider value={{active: activeServer, setActive: setActiveServer}}>
      <Select m={"10px 25px 50px 25px"} w="auto" variant={"filled"} colorScheme="mochaPink" placeholder="General">
        {categories.map((category, id) => {
          return <option key={id}>{category}</option>
        })}
      </Select>
      <Box h={"300px"} overflow="auto">
        {servers.map((server, id) => {
          const lastActivityDate: Date = server.lastActivityTime.toDate()
          let lastActivityString: string
          const yesterday: Date = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          if (yesterday.toDateString() === lastActivityDate.toDateString()) {
            lastActivityString = "Yesterday"
          } else if (new Date().toDateString() === lastActivityDate.toDateString()) {
            lastActivityString = `${lastActivityDate.getHours()}:${lastActivityDate.getMinutes()}`
          } else {
            lastActivityString =
              `${lastActivityDate.getDate()}/${lastActivityDate.getMonth()}/${lastActivityDate.getFullYear()}`
          }
          return (
            <>
              <ServerCard server={server} id={id} lastActivityString={lastActivityString} />
            </>
          )
        })}
      </Box>
      <Center h={"20px"}>
        <Icon w={5} h={5} as={FaAngleDown} />
      </Center>
      <Flex mt={"30px"}>
        <Menu >
          <MenuButton
            as={Button}
            m="10px"
            ml="15px"
            fontWeight={400}
            colorScheme="mochaPink"
          >Create Server</MenuButton>
          <MenuList bg="#181922">
            <MenuItem>
              Use Existing Template
            </MenuItem>
            <MenuItem>
              Build From Scratch
            </MenuItem>
          </MenuList>
        </Menu>
        <Button m="10px" variant={"outline"} colorScheme={"mochaPink"}>
          Join Server
        </Button>
      </Flex>
    </ActiveServer.Provider>
  )
}

const ServerCard = (props) => {
  const { server, id, lastActivityString } = props
  const { isOpen, onToggle } = useDisclosure()
  const { active, setActive } = useContext(ActiveServer)
  const [activeChannel, setActiveChannel] = useState<Array<boolean>>([true, false, false])
  function ifActive(id: number, value1: string, value2: string) {
    if (activeChannel[id] === true) {
      return value1
    }
    return value2
  }
  return (
    <>
      <Flex mt={"25px"} ml={"20px"} cursor="pointer" userSelect={"none"} onClick={()=>{
        active[0] === id ? setActive([-1, 0]) : setActive([id, activeChannel.indexOf(true)])
      }}>
        <Avatar borderRadius={"10px"} src={server.icon} />
        <Flex flexDir={"column"} justifyContent="center" ml={"10px"}>
          <Text fontSize={"17px"} fontWeight={500}>{server.name}</Text>
          <Text fontSize={"13px"} fontWeight={400}>{server.lastActivity}</Text>
        </Flex>
        <Spacer />
        <Flex flexDir={"column"} alignItems="center" mr="20px">
          <Text color={"#B0B1BD"} fontSize={"14px"}>{lastActivityString}</Text>
          <Badge
            variant="solid"
            w="30px"
            alignSelf={"flex-end"}
            mt={2}
            bg="mochaPink.300"
            color={"#000"}
            textAlign={"center"}
            fontWeight={400}
            fontSize={"12px"}
            borderRadius={"10px"}>19</Badge>
        </Flex>
      </Flex>
      <Collapse in={active[0] === id} animateOpacity>
        <Box mt={"20px"} ml={"15px"}>
          <Flex
            bg={ifActive(0, "#383942", "")}
            pt={"5px"}
            pb={"5px"}
            pl={"15px"}
            alignItems={'center'}
            cursor="pointer"
            onClick={() => {
              setActiveChannel([true, false, false])
              setActive([id, 0])
            }}>
            <Icon as={AiOutlineMinus} color={ifActive(0, "#DCDEF0", "#B0B1BD")} />
            <Icon ml={"5px"} as={FaHashtag} color={ifActive(0, "#DCDEF0", "#B0B1BD")} />
            <Text ml={"10px"} color={ifActive(0, "#DCDEF0", "#B0B1BD")}>
              General
            </Text>
          </Flex>
          <Flex
            bg={ifActive(1, "#383942", "")}
            pt={"5px"}
            pb={"5px"}
            pl={"15px"}
            alignItems={'center'}
            cursor="pointer"
            onClick={() => {
              setActiveChannel([false, true, false])
              setActive([id, 1])
            }}>
            <Icon as={AiOutlineMinus} color={ifActive(1, "#DCDEF0", "#B0B1BD")} />
            <Icon ml={"5px"} as={MdTask} color={ifActive(1, "#DCDEF0", "#B0B1BD")} />
            <Text ml={"10px"} color={ifActive(1, "#DCDEF0", "#B0B1BD")}>
              Tasks
            </Text>
          </Flex>
          <Flex
            bg={ifActive(2, "#383942", "")}
            pt={"5px"}
            pb={"5px"}
            pl={"15px"}
            alignItems={'center'}
            cursor="pointer"
            onClick={() => {
              setActiveChannel([false, false, true])
              setActive([id, 2])
            }}>
            <Icon as={AiOutlineMinus} color={ifActive(2, "#DCDEF0", "#B0B1BD")} />
            <Icon ml={"5px"} as={FaMap} color={ifActive(2, "#DCDEF0", "#B0B1BD")} />
            <Text ml={"10px"} color={ifActive(2, "#DCDEF0", "#B0B1BD")}>
              RoadMap
            </Text>
          </Flex>
        </Box>
      </Collapse>
    </>
  )
}