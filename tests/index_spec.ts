import CaffeStore, { Server, User } from '../model/firestore'
import { DocumentReference, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore'
import { expect } from 'chai'
import 'mocha'
/**
 * Tests to check firestore structure and CaffeStore get method
 *  
 */
describe('CaffeStore Model', () => {
  describe(".getActualPath", () => {
    it("should return array of path segments", () => {
      expect(CaffeStore.getActualPath("/server/test")).to.deep.equal(["server", "test"])
    })
  })
  describe(".get Server", () => {
    it("Should return test server with appropriate properties", async () => {
      const server = (await CaffeStore.get("/server/test")) as Server
      console.log(server)
      expect(server).to.be.instanceOf(Object)
      expect(server).to.have.own.property("name")
      expect(server).to.have.own.property("icon")
      expect(server).to.have.own.property("admins")
      expect(server).to.have.own.property("category")
      expect(server).to.have.own.property("githubCommits")
      expect(server).to.have.own.property("lastActivity")
      expect(server).to.have.own.property("lastActivityTime")
      expect(server).to.have.own.property("members")
      expect(server).to.have.own.property("tasks")
    })
  })
  describe(".get User", () => {
    it("Should return test user with appropriate property", async () => {
      const user = (await CaffeStore.get("/users/test")) as User
      console.log(user)
      expect(user).to.be.instanceOf(Object)
      expect(user).to.have.own.property("name")
      expect(user).to.have.own.property("fullName")
      expect(user).to.have.own.property("email")
      expect(user).to.have.own.property("servers")
      expect(user).to.have.own.property("uid")
      expect(user).to.have.own.property("avatar")
      expect(user).to.have.own.property("createdAt")
    })
  })
})