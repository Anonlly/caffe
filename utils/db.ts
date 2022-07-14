// Dexie.js initialization file
import Dexie, { Table } from 'dexie';
import { Timestamp } from "firebase/firestore"
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
  tasks: string[]
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
  server: string
  title: string
}


export class CaffeDexieDB extends Dexie {
  servers!: Table<Server>
  users!: Table<User>
  tasks!: Table<Task>
  constructor() {
    super('CaffeDatabase')
    this.version(1).stores({
      servers:"id, name, category",
      users: "uid, fullName, name, email",
      tasks: "id, title, category"
    })
  }
}

export const db = new CaffeDexieDB()