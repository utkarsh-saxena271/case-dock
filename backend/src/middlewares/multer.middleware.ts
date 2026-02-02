import multer from "multer";

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, "./public/temp")
//     },
//     filename: function (req, file, cb) {
//   const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9)
//   cb(null, uniqueName + "-" + file.originalname)
// }
//   })
  
// export const upload = multer({ 
//     storage, 
// })

import fs from "fs";
import path from "path";

const uploadPath = path.join(process.cwd(), "public/temp");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + "-" + file.originalname);
  }
});

export const upload = multer({ storage });