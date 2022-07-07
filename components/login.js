import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Divider,
  FormControl,
  FormHelperText,
  Input,
  Icon,
  FormLabel,
  Button,
  Text
} from "@chakra-ui/react"
import { useState, useContext } from "react"
import color from "../etc/colors"
import { UserContext, AppContext } from "../pages"
import { FaGoogle, FaGithub } from 'react-icons/fa'
import app from "../utils/firebase"
import * as auth from "firebase/auth"
import * as firestore from "firebase/firestore"
// Default profile for new users (if no avatar or displayName is provided)
const base = {
  Avatar: `http://localhost:3000/profile.jpg`,
  displayName: (email) => {
    return email.split("@")[0]
  }
}
export default function Login(props) {
  const { userStore, dispatchUserStore } = useContext(UserContext)
  const { appStore, dispatchAppStore } = useContext(AppContext)

  /**
   * loginWithProvider function, handle both google and github login
   * this function dispatch user data from 
   * firebase auth and firestore to userStore 
   * which will be saved inside localstorage API
   * @param {"google" | "github"} providerChoice 
   */
  const loginWithProvider = (providerChoice) => {
    (async () => {
      const Auth = auth.getAuth(app)
      let provider
      if (providerChoice === "google") {
        provider = new auth.GoogleAuthProvider()

      } if (providerChoice === "github") {
        provider = new auth.GithubAuthProvider()
      }
      const result = await auth.signInWithPopup(Auth, provider);

      // Get Documment reference for either creating new user
      // or get data from existing one, uid is used as document id
      const Firestore = firestore.getFirestore(app)
      const document = firestore.doc(Firestore, "/users/" + result.user.uid)
      const docData = (await firestore.getDoc(document)).data()
      console.log(result)
      console.log(docData)
      // Check either user is new or already exists
      if(docData !== undefined && (docData.name !== undefined || docData.name !== null)){ 

        // If user already exists, name from firestore is used as displayName

        // syncronize displayName from auth data and firestore data
        firestore.setDoc(document, {
          uid: result.user.uid,
          name: docData.name,
          email: result.user.email,
          createdAt: result.user.metadata.creationTime,
          avatar: result.user.photoURL,
          fullName: result.user.displayName
        })

        // dispatch auth data to userStore
        console.log("dispatching user Store")
        dispatchUserStore({
          type: "Login", data: {
            uid: result.user.uid,
            name: docData.name,
            email: result.user.email,
            createdAt: result.user.metadata.creationTime,
            avatar: result.user.photoURL,
            fullName: result.user.displayName
          }
        })
        console.log("dispatch complete")
      } else {
        // If user is new, displayName from auth data is used as name

        // create new user Document 
        firestore.setDoc(document, {
          uid: result.user.uid,
          name: result.user.displayName.split(" ")[0],
          email: result.user.email,
          createdAt: result.user.metadata.creationTime,
          avatar: result.user.photoURL,
          fullName: result.user.displayName
        })

        // dispatch auth data to userStore
        dispatchUserStore({
          type: "Login", data: {
            uid: result.user.uid,
            name: result.user.displayName.split(" ")[0],
            email: result.user.email,
            createdAt: result.user.metadata.creationTime,
            avatar: result.user.photoURL,
            fullName: result.user.displayName
          }
        })
      }
      dispatchAppStore({ type: "ChangeConfig", data: { config: { isLoggedIn: true } } })
    })()
  }
  const [pw, setPw] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  /**
   * Function to handle login with email and password
   * this function has the same data flow as loginWithProvider
   * @param {FormEvent} e 
   */
  const handleLogin = (e) => {
    e.preventDefault();
    (async () => {
      try {
        setError("")
        const Auth = auth.getAuth(app)
        const result = await auth.signInWithEmailAndPassword(Auth, email, pw)
        const Firestore = firestore.getFirestore(app)
        const document = firestore.doc(Firestore, "/users/" + result.user.uid)
        const docData = (await firestore.getDoc(document)).data()
        let disname
        if (result.user.displayName === null && result.user.photoURL === null) {
          disname = base.displayName(result.user.email)
          await auth.updateProfile(result.user, {
            displayName: base.displayName(result.user.email),
            photoURL: base.Avatar
          })
        } else if (result.user.displayName === null) {
          disname = base.displayName(result.user.email)
          await auth.updateProfile(result.user, {
            displayName: base.displayName(result.user.email)
          })
        } else if (result.user.photoURL === null) {
          disname = base.displayName(result.user.email)
          await auth.updateProfile(result.user, {
            photoURL: base.Avatar
          })
        }else{
          if(docData.name !== undefined || docData.name !== null){  
            disname = docData.name           
          }
        }

        dispatchAppStore({ type: "ChangeConfig", data: { config: { isLoggedIn: true } } })
        firestore.setDoc(document, {
          uid: result.user.uid,
          name: disname,
          email: result.user.email,
          createdAt: result.user.metadata.creationTime,
          avatar: result.user.photoURL,
          fullName: result.user.displayName
        })
        dispatchUserStore({
          type: "Login", data: {
            uid: result.user.uid,
            name: disname,
            email: result.user.email,
            createdAt: result.user.metadata.creationTime,
            avatar: result.user.photoURL === null ? base.Avatar : result.user.photoURL,
            fullName: result.user.displayName === null ? base.displayName(result.user.email) : result.user.displayName
          }
        })
      } catch (e) {
        setError("The provided credential isn't correct.")
      }
    })()
  }
  const { isLoginOpen, onLoginOpen, onLoginClose } = props
  return (
    <Modal closeOnEsc={false} closeOnOverlayClick={false} isOpen={isLoginOpen} onClose={onLoginClose}>
      <ModalOverlay />
      <ModalContent w={350} bg={color.subBase} color={"#aaa"}>
        <ModalHeader textAlign={"center"}>Login</ModalHeader>
        <Divider />
        <ModalBody display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}
          marginRight="none">
          <form width="auto" onSubmit={handleLogin}>
            <FormControl w={300} isRequired>
              <FormLabel htmlFor='email'>Email</FormLabel>
              <Input

                variant="filled"
                focusBorderColor='mochaPink.300'
                colorScheme={"mochaPink"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id='email'
                placeholder='Email' />
              <FormLabel mt={15} htmlFor="password">Password</FormLabel>
              <Input
                variant="filled"
                colorScheme={"mochaPink"}
                id="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                focusBorderColor='mochaPink.300'
                placeholder="Password"
                type="password" />
              <FormHelperText>For elevated user.</FormHelperText>
              <FormHelperText color={"red.200"}>{error}</FormHelperText>
              <Button mt={4} variant={"outline"} colorScheme={"mochaPink"} type="submit">Login</Button>
            </FormControl>
          </form>
          <Text size="sm" color="gray.300">Or</Text>
          <Button
            w={"100%"}
            leftIcon={<Icon as={FaGoogle} />}
            colorScheme={"mochaPink"}
            variant="solid"
            onClick={() => loginWithProvider("google")}
            mt={5}>
            Login with Google
          </Button>
          <Button
            w={"100%"}
            leftIcon={<Icon as={FaGithub} />}
            colorScheme={"mochaTeal"}
            onClick={() => loginWithProvider("github")}
            variant="solid"
            mt={3}>
            Login with Github
          </Button>
          <Text fontSize={"13px"} mt={3} alignSelf="flex-start" color="gray.400" mb={10}>For normal user and new user.</Text>

        </ModalBody>
      </ModalContent>
    </Modal>
  )
}