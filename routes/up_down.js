const multer = require('multer');
const path = require("path");
const fs = require('fs');
const mysql = require('mysql');

const upload = multer({dest: './uploads' }).single('uploader');

let db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'officehelper',
    multipleStatements : true
})

db.connect((error)=>{
    if(!error){
        console.log("Connected to fileshare");
    }
    else{
        console.log(error);
    }
})

exports.uploads = (req, res) => {
    let Sender, toGive;
    upload(req, res, (err) => {
        if(err){
            console.log(err);
            Sender = req.body.sender;
        }
        else{
            toGive = req.body.togive;
            Sender = req.body.sender;
            let filename = req.file.originalname;
            fs.rename(req.file.path, './uploads/' + toGive + '/' + req.file.originalname, (err) => {
                if(err){
                    console.log(err);
                }
            })
            let sql = `insert into upload_download (sender, receiver, filename) values ?`;
            let value = [[Sender, toGive, filename]];
            db.query(sql, [value], (error) => {
                if(error){
                    console.log(error);
                }
                else{
                    console.log('uploaded info to database successfully');
                }
            })
        }
        return res.redirect('/fileshare/' + Sender);
    })
}

exports.downloads = (req, res) => {
    const id = req.params.id;
    const filename = req.query.filename;

    const downloadPath = ('./uploads/' + id + '/' + filename);

    res.download(downloadPath, (err) => {
        if(err){
            console.log(err);
        }
        else{
            console.log('download initiated.');
        }
    })
}

exports.removeFile = (req, res) => {
    const serial = req.params.serial;
    const receiver = req.params.receiver;
    const filename = req.params.filename;

    const path = `./uploads/${receiver}/${filename}`;

    fs.unlink( path, (error) => {
        if(error){
            console.log(error);
            res.redirect(`/file_error_page/` + receiver);
        }
        else{
            let sql = `DELETE FROM upload_download WHERE serial = ?`;
            db.query ( sql, [serial], (error) => {
                if(error){
                    console.log(error);
                }
                else{
                    res.redirect(`/fileshare/` + receiver);
                }
            })
        }
    })
}