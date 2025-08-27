import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); 
    const filename = `product-${Date.now()}${ext}`;
    cb(null, filename)
  }
})

//Filter file upload hanya boleh JPG/JPEG/PNG
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if(allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Hanya file JPG/PNG yang diperbolehkan"));
}

const upload = multer({ storage: storage, fileFilter })

export default upload;