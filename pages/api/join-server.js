import * as admin from "firebase-admin"
import serviceAccount from "../../serviceAccountKey.json"

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://caffe-cacf0-default-rtdb.asia-southeast1.firebasedatabase.app"
  })
}
// TODO: add invite link feature that doesn't reveal server's id
/**
 * join-server route handler function
 * main purpose of this function is to let user 
 * join a server without directly accessing firebase firestore
 * 
 * @param {http.IncomingMessage} req
 * https://nodejs.org/api/http.html#class-httpincomingmessage 
 * @param {http.ServerResponse} res 
 * https://nodejs.org/api/http.html#class-httpserverresponse
 * 
 * Expected Query: 
 *  - {string} ServerID : Server ID (required)
 * Expected Body: None
 * Required Headers: 
 *  - Authorization: Bearer <token>
 */
export default function handler(req, res) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const idToken = authHeader.split(" ")[1];
    admin
      .auth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        const uid = decodedToken.uid
        const { ServerID } = req.query
        const db = admin.firestore()
        db.collection("server")
          .doc(ServerID)
          .get()
          .then((snapshot) => {

            if (snapshot.empty) {

              res.status(404).json({ status: "fail", message: "Server not found" })
            } else {
              const data = snapshot.data()
              if(data.members.includes(uid)){
                return res.status(400).json({ status: "fail", message: "You are already in this server" })
              }
              snapshot.ref.update({...data, members: [...data.members, uid]})
              .then((x)=>{
                res.status(200).json({ status: "success" })
              })
              .catch((err)=>{
                console.log(err)
                res.status(500).json({ status: "fail", message: "Internal server error" })
              })

            }
          })
        // Further logic performed by your API route here
      })
      .catch((error) => {
        console.log(error)
        return res.sendStatus(403)
      });
  } else {
    res.sendStatus(401);
  }
}