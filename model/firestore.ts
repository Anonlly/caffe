import * as firestore from "firebase/firestore"
import { DocumentReference, DocumentData, Timestamp, QueryDocumentSnapshot } from "firebase/firestore"
import app from "../utils/firebase"
class Server {
  id: string
  name: string
  icon: string
  admins: string[]
  category: string
  githubCommits: string[]
  lastActivity: string
  lastActivityTime: Timestamp
  members: string[]
  tasks: DocumentReference[]
}

class User {
  avatar: string
  createdAt: string
  email: string
  fullName: string
  name: string
  servers: string[]
  uid: string
}

class Task{
  category: string
  creationTime: Timestamp
  files: string[]
  githubCommits: string[]
  id: string
  progress:number
  server: DocumentReference
  title: string
}

export { Server, User, Task }

interface CaffeStoreSetResponse {
  status: "Success" | "Failed",
  response: Promise<void> 
}

interface CaffeStoreType {
  Firestore: firestore.Firestore,
  get: (path: string) => Promise<
    DocumentData | // if Path refers to a document
    QueryDocumentSnapshot<DocumentData> // if path refers to collection
  >,
  getActualPath: (path: string) => string[],
  set: (path: string, data: object) => CaffeStoreSetResponse
}

const CaffeStore: CaffeStoreType = {
  Firestore: firestore.getFirestore(app),
  getActualPath: function (pathString) {
    return pathString.split("/").filter(a => a)
  },
  get: function (pathString: string) {
    const path: string[] = this.getActualPath(pathString)
    if (path.length === 0) {
      throw new Error("Path is invalid")
    }
    if (path.length >= 1 && path.length < 2) {
      const collection = firestore.collection(this.Firestore, path[1])
      return (async () => {
        return (await firestore.getDocs(collection)).docs
      })()
    }
    else if (path.length >= 2) {
      const document: DocumentReference = firestore.doc(this.Firestore, pathString)
      return (async () => {
        return (await firestore.getDoc(document)).data()
      })()
    }
  },
  set: function(pathString, data){
    const document: DocumentReference = firestore.doc(this.Firestore, pathString)
    const response = firestore.setDoc(document, data)
    return {
      status: "Success",
      response
    }
  }
}
export default CaffeStore
