const mysql = require('mysql');
const loginData = require('./login');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

// let db = mysql.createConnection({
//     host : process.env.DB_Host,
//     user : process.env.DB_User,
//     password : process.env.DB_Password,
//     database : process.env.DB,
//     multipleStatements : true
// })

let db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'officehelper',
    multipleStatements : true
})

db.connect((error)=>{
    if(!error){
        console.log("Connected to chat");
    }
    else{
        console.log(error);
    }
})

exports.chat = (req, res) => {
    try {

        const { room, pass, id } = req.body;
        if(!room || !pass){
            req.session.success = false;
            res.redirect('/room/' + id);
            return 0;
        }

        db.query('select * from chatroom where room = ?', [room], (error, results) => {
            if(error){
                console.log(error);
            }
            else if(results.length == 0){
                let sql_autoset = `SET @count = 0;
                UPDATE chatroom SET chatroom.id = @count:= @count + 1;
        
                ALTER TABLE chatroom AUTO_INCREMENT = 1;`
                db.query(sql_autoset, (error) => {
                    if(error){
                        console.log(error);
                    }
                })

                let sql = "insert into chatroom (room, password, host, table_exist) values ?";
                let values = [[ room, pass, id, 0 ]];
                db.query(sql, [values], (error) => {
                    if(error){
                        console.log(error);
                    }
                    else{
                        db.query('select * from chatroom where room = ?', [room], (error, results) => {
                            if(error){
                                console.log(error);
                                return 0;
                            }
                            let cRoom = `${results[0].room}`;
                            let cHost = `${results[0].host}`;
                            exports.cRoom = cRoom;
                            exports.cHost = cHost;
                            res.redirect('/chat/' + id + '/' + cRoom + '/' + cHost);
                        })
                    }
                });
            }
            else if(pass != results[0].password){
                req.session.success = false;
                res.redirect('/room/' + req.params.id);
                return 0;
            }
            else{
                let cRoom = `${results[0].room}`;
                let cHost = `${results[0].host}`;
                exports.cRoom = cRoom;
                exports.cHost = cHost;
                res.redirect('/chat/' + id + '/' + cRoom + '/' + cHost);
            }
        })

    } catch (error) {
        console.log(error);
    }
}