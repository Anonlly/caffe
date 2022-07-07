import * as admin from "firebase-admin"
import serviceAccount from "../../serviceAccountKey.json"
import sharp from "sharp" // https://sharp.pixelplumbing.com/

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://caffe-cacf0-default-rtdb.asia-southeast1.firebasedatabase.app"
})

const compress = sharp()
  .resize({
    width: 300,
    height: 300,
    fit: sharp.fit.fill
  });
/**
 * Image route handler function
 * the only purpose of this function is to compress 
 * the user-uploaded avatar and reupload it to firebase storage
 * 
 * @param {http.IncomingMessage} req
 * https://nodejs.org/api/http.html#class-httpincomingmessage 
 * @param {http.ServerResponse} res 
 * https://nodejs.org/api/http.html#class-httpserverresponse
 * 
 * Expected query :
 * {string} uid : User ID (required)
 */
export default function handler(req, res) {
  (async () => {
    const { uid } = req.query
    const storage = admin.storage(app)
    const bucket = storage.bucket()
    const files = await bucket.getFiles({
      prefix: `user/${uid}`
    })
    const file = files[0][0]
    file.createReadStream()
      .on("error", (err) => {
        res.status(500)
      })
      .on("end", () => {
        res.status(200)
      })
      .pipe(compress)
      .pipe(file.createWriteStream())
    res.status(200).json({ name: 'John Doe' })
  })()
}
