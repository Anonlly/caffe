import { useContext, useEffect, useRef, useState } from 'react'
import color from '../etc/colors'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  Button,
  Icon,
  Box,
  ModalFooter,
  FormControl,
  FormHelperText,
  Input,
  FormLabel,
  Image,
  Flex,
  IconButton,
  useDisclosure
} from "@chakra-ui/react"
import ReactCrop, {
  centerCrop,
  makeAspectCrop
} from "react-image-crop"
import { imgPreview } from './imgPreview'
import 'react-image-crop/dist/ReactCrop.css'
import { UserContext, AppContext } from "../pages"
import { FaEdit } from 'react-icons/fa'
import app from "../utils/firebase"
import * as auth from "firebase/auth"
import * as firestore from "firebase/firestore"
import * as storage from "firebase/storage"

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function Settings(props) {
  const { userStore, dispatchUserStore } = useContext(UserContext)
  const { isOpen: isCropModalOpen, onOpen: openCropModal, onClose: closeCropModal } = useDisclosure()
  const [name, setName] = useState("")
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()
  const [displayName, setDisplayName] = useState("")
  const [newAvatarURL, setNewAvatarURL] = useState({})
  const { isOpen, onOpen, onClose } = props
  const fileref = useRef(null)
  const imgRef = useRef(null)

  useEffect(() => {
    if (userStore.name !== "" && userStore.fullName !== "") {
      setName(userStore.fullName)
      setDisplayName(userStore.name)
    }
  }, [userStore])

  // Command handling function, for now only for logging out
  const handleCommand = (command) => {
    switch (command) {
      case "logout":
        onClose()
        auth.getAuth(app).signOut()
        dispatchUserStore({ type: "Logout" })
        break;
      default:
        throw new Error("Unknown command")
    }
  }

  // Invoked when Edit icon is clicked 
  // then it simulate click to real file input element
  const changeAvatar = () => {
    fileref.current.click()
  }

  // Invoked when file input element is changed
  // then it prepare file's url to be cropped
  const handleAvatarChange = () => {
    const reader = new FileReader()
    reader.addEventListener('load', () =>
      setNewAvatarURL(reader.result.toString() || ''),
    )
    reader.readAsDataURL(fileref.current.files[0])
    openCropModal()
  }

  // Send modified username and fullname to firestore
  // and update data in userStore
  const saveChange = () => {
    (async () => {
      onClose()
      const Auth = auth.getAuth(app)

      const Firestore = firestore.getFirestore(app)
      const document = firestore.doc(Firestore, "/users/" + Auth.currentUser.uid)
      const docData = (await firestore.getDoc(document)).data()
      firestore.setDoc(document, { ...docData, fullName: name, name: displayName })
      dispatchUserStore({ type: "UpdateName", data: { fullName: name, name: displayName } })
    })()
  }
  // After new-avatar loaded
  // set default cropping point and aspect ratio
  const handleLoad = (e) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, 1 / 1))
  }

  // save cropped image to firestore, firebase-auth, and userStore
  const updateAvatar = () => {
    (async () => {
      const Auth = auth.getAuth(app)

      const Firestore = firestore.getFirestore(app)
      const document = firestore.doc(Firestore, "/users/" + Auth.currentUser.uid)
      const docData = (await firestore.getDoc(document)).data()

      const Storage = storage.getStorage(app, "gs://caffe-cacf0.appspot.com")
      const storageRef = storage.ref(Storage, "/user/" + Auth.currentUser.uid)
      const croppedImg = await imgPreview(imgRef.current, completedCrop)
      const result = await storage.uploadBytes(storageRef, croppedImg)
      const url = await storage.getDownloadURL(result.ref)
      firestore.setDoc(document, { ...docData, avatar: url })
      dispatchUserStore({ type: "UpdateAvatar", data: { avatar: url } })
      closeCropModal()
    })()
  }
  return (
    <>
      <Modal isOpen={isCropModalOpen} onClose={closeCropModal}>
        <ModalOverlay />
        <ModalContent bg={color.subBase} color={"#aaa"}>
          <ModalHeader>Crop Avatar</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {Boolean(newAvatarURL) &&
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1 / 1}>
                <img ref={imgRef} src={newAvatarURL} onLoad={handleLoad} />
              </ReactCrop>
            }
          </ModalBody>
          <ModalFooter>
            <Button onClick={updateAvatar}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={color.subBase} color={"#aaa"}>
          <ModalHeader>Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexDir={"column"} justifyContent="center" alignItems={"center"}>
              <IconButton
                position="absolute"
                top={"180px"}
                right={"155px"}
                variant={"solid"}
                colorScheme={"black"}
                onClick={changeAvatar}
                bg={"mochaPink.200"}
                icon={<Icon as={FaEdit} />} />
              <Flex>
                <Image src={userStore.avatar} w={150} h={150} borderRadius={"100px"} />
              </Flex>
              <FormControl>
                <input onChange={handleAvatarChange} accept="image/*" type="file" ref={fileref} style={{ display: "none" }} id="fileup" />
                <FormLabel htmlFor='Name'>Display Name</FormLabel>
                <Input
                  focusBorderColor='mochaPink.200'
                  colorScheme={"mochaPink"}
                  variant={"filled"}
                  onChange={(e) => setDisplayName(e.target.value)}
                  id="Name"
                  value={displayName} />
                <FormLabel mt={2} htmlFor='Name'>Name</FormLabel>
                <Input
                  focusBorderColor='mochaPink.200'
                  colorScheme={"mochaPink"}
                  variant={"filled"}
                  onChange={(e) => setName(e.target.value)}
                  id="Name"
                  value={name}
                />
              </FormControl>


            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="solid"
              mr={"auto"}
              colorScheme={"mochaPink"}
              alignSelf={"flex-start  "}
              onClick={() => { handleCommand("logout") }}
            >
              Logout
            </Button>
            <Button
              disabled={name === userStore.fullName && displayName === userStore.name ? "disabled" : ""}
              colorScheme='mochaPink'
              variant="solid"
              mr={3}
              onClick={saveChange}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}