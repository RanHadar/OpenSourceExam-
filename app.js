//Here are all of our imports
const express = require('express'); 
const app = express();
const fs = require("fs");
const multer = require("multer");


const { TesseractWorker } = require('tesseract.js');
const worker = new TesseractWorker(); //with this worker we're going to analyze the images

//Storage
const storage = multer.diskStorage({ //this folder to where we upload the file
    destination: (req,file, cb) => {
        cb(null,"./uploads")
    },
    filename: (req,file,cb) => {
        cb(null,file.originalname);
    }
});
const upload = multer({storage:storage}).single('avatar');

//Sets the view engien to ejs
app.set("view engine","ejs");
app.use(express.static("public"));

//ROUTES
app.get('/', (req,res) => {
    res.render('index');
});

app.post("/upload", (req,res) => {
    upload(req,res,err => {
        console.log(req.file);
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            console.log(req.file.originalname);
            if(err) return console.log('This is your error', err);

            worker
            .recognize(data, "heb", {tessjs_create_pdf: '1'})
            .progress(progress => {
                console.log(progress);
            })
            .then(result => {
                res.redirect("/download");
            })
            .finally(() => worker.terminate());
        });
    });
});

app.get("/download", (req,res) => {
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    res.download(file);
})

// app.use("/views", express.static(__dirname + "/views"));

//start Our server
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log(`Hey Im running on port ${PORT}`));