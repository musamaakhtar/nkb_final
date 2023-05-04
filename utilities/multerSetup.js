const multer = require('multer');


const storage =(folderName)=> {
    return multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `static/images/${folderName}`)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})}


const upload = (folderName)=>{
    return multer({ storage: storage(folderName) })
}

module.exports = {upload}
// export const imageUpload = upload.fields([{ name: 'images', maxCount: 10 }])