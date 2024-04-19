
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/articleImages/'),
    filename: (req, file, cb) => {
        cb(null,file.originalname);
      }
})

const imageFilter = function (req, file, cb) {
  
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|avif|xbm|tif|jfif|ico|tiff|svg|webp|bmp|pjp|svgz|apng|pjpeg)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};


const upload = multer( { storage: storage, fileFilter: imageFilter } )

module.exports = upload