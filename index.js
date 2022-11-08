const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const PORT = process.env.PORT || 8000;
const app = express();
var nodemailer = require("nodemailer");

var sender = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "office@learningroomdigital.com",
    pass: "nsminxxrfxrjlxpc",
  },
});

// var sender = nodemailer.createTransport({
//   service:"gmail",
//   auth:{
//     user:"dharundds@gmail.com",
//     pass:"becjaziwymugppqv"
//   }
// })

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "uploads");
  },
  filename: (req, file, callBack) => {
    callBack(null, `${file.originalname}`);
  },
});
let upload = multer({ dest: "uploads/" });
let uploadReceipt = multer({ dest: "uploadsReceipt/" });

app.use(
  cors({
    origin: ["https://learningroomdigital.com/form/","http://localhost:3000"],
    // origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 200,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.post("/api/learningroom/contact",(req,res)=>{
  const fname = req.body.fname;
  const email = req.body.email;
  const phonenum = req.body.phonenum;
  const message = req.body.message;

  var mail = {
    from:"office@learningroomdigital.com",
    to:["office@learningroomdigital.com"],
    subject: `Enquiry submitted from Learningroom website by ${fname}`,
    html:` 
      <style>
          span{
            font-weight: bold;
          } 
      </style>
      <h3>Respect Sir,</h3>
      <p>An enquiry is submitted by ${fname} and phone number: <span>${phonenum}</span>, email: <span>${email}</span> </p>
      <p>The message sent is : <span>${message}</span></p>`
  }

  sender.sendMail(mail,(error,info)=>{
    if(error){
      console.log(error);
    }else{
      console.log("Email sent successfully: ", info.response);
      res.send(info.accepted)
    }
  })

})

app.post("/api/uploadFileAPI", upload.single("file"), (req, res, next) => {
  const file = req.file;
  const sname = req.body.sname;
  const sclass= req.body.sclass;
  
  if (!file) {
    const error = new Error("No File");
    error.httpStatusCode = 400;
    return next(error);
  }
  res.send(file);
  var a = file.originalname.split(".");
  let fileName = a[0] + "_" + file.filename + "." + a[1];
  fs.rename("uploads/" + file.filename, "uploads/" + fileName, () => {});
  var mail = {
    from: "office@learningroomdigital.com",
    to: ["office@learningroomdigital.com","class1@learningroomdigital.com"],
    subject: `Application for ${sname}`,
    text: `The application form of the student ${sname} of class ${sclass} is attached below`,
    attachments: [
      {
        filename: `${fileName}`,
        path: `uploads/${fileName}`,
      },
    ],
  };

  sender.sendMail(mail, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent successfully: " + info.response);
      let file = "uploads/" + fileName;
      fs.unlinkSync(file);
    }
  });
});

app.post(
  "api/uploadFileAPIReceipt",
  uploadReceipt.single("file"),
  (req, res, next) => {
    const file = req.file;
    const sname = req.body.sname;
    const sclass = req.body.sclass;
    const ino = req.body.ino;
    let g;

    if (ino==1){
      g='st'
    }else if (ino==2){
      g='nd'
    }else{
      g='th'
    }
    if (!file) {
      const error = new Error("No File");
      error.httpStatusCode = 400;
      return next(error);
    }
    res.send(file);
    var a = file.originalname.split(".");
    let fileName = a[0] + "_" + file.filename + "." + a[1];
    fs.rename(
      "uploadsReceipt/" + file.filename,
      "uploadsReceipt/" + fileName,
      () => {}
    );
    var mail = {
      from: "office@learningroomdigital.com",
      to: ["office@learningroomdigital.com","class1@learningroomdigital.com"],
      subject: `Receipt for ${sname}`,
      text: `The student ${sname} of class ${sclass} has paid the ${ino}${g} installation. The receipt is attached below`,
      attachments: [
        {
            filename: `${fileName}`,
            path: `uploadsReceipt/${fileName}`,
        }
    ]
    };

    sender.sendMail(mail, function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent successfully: "
                     + info.response);
        let file = 'uploadsReceipt/'+fileName;
        fs.unlinkSync(file)
      }
    });
   
  }
);

app.listen(PORT, () => console.log(`listening in ${PORT}`));
