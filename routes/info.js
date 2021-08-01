const mysql = require('mysql');
const auth = require('./login');
const hostRoom = require('./tochat');
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
        console.log("Connected to Info");
    }
    else{
        console.log(error);
    }
})

exports.main_with_id = (req, res) => {
    if(!auth.id){
        res.redirect('/');
        return 0;
    }
    else if(auth.id == req.params.id){
        const ID = req.params.id;
        let Tier, Username;
    
        db.query('select * from employee where ID = ?',[ID] , (error, results) => {
            if(error){
                console.log(error);
            }
            else{
                res.render('main', {
                    id: `${results[0].ID}`,
                    name: `${results[0].Name}`,
                    designation: `${results[0].Designation}`,
                    email: `${results[0].Email}`,
                    tier: `${results[0].Tier}`
                })
            }
            Tier = `${results[0].Tier}`;
            Username = `${results[0].Name}`;
            exports.Tier = Tier;
            exports.Username = Username;
        })
        exports.ID = ID;

    }
    else{
        res.redirect('/');
        return 0;
    }
}

exports.chat_with_room_host = (req, res) => {
    if(!auth.id){
        res.redirect('/');
        return 0;
    }
    else if(hostRoom.cRoom == req.params.room && hostRoom.cHost == req.params.host){

        const ID_chat = req.params.id;
        exports.ID_chat = ID_chat;
        let table_exist = false;
        let cRoom = hostRoom.cRoom;
        let cHost = hostRoom.cHost;
        db.query("select table_exist from chatroom where room = ?", [cRoom], (error, results) => {
            if(`${results[0].table_exist}` == '0'){
                db.query('update chatroom set table_exist = 1 where room = ?', [cRoom]);
                console.log('chatroom updated');
            }
            else{
                table_exist = true;
            }

            if(table_exist){
                if(error){
                    console.log(error);
                }
                else{
                    console.log(`table name ${cRoom} exist`);
                    db.query('select * from employee where ID = ?',[ID_chat] , (error, results) => {
                        if(error){
                            console.log(error);
                        }
                        else{
                            res.render('chat', {
                                id: `${results[0].ID}`,
                                name: `${results[0].Name}`,
                                tier: `${results[0].Tier}`,
                                room: hostRoom.cRoom,
                                host: hostRoom.cHost
                            })
                        }
                    })
                }
                return 0;
            }
            else{
                let sql = `create table ${cRoom} (
                    num int(6) unsigned auto_increment primary key,
                    id varchar(5) not null,
                    username varchar(20) not null,
                    date varchar(15) not null,
                    time varchar(15) not null,
                    msg text
                )`;
        
                db.query(sql, (error, results) => {
                    if(error){
                        console.log(error);
                    }
                    else{
                        console.log(`table name ${cRoom} created`);
                        db.query('select * from employee where ID = ?',[ID_chat] , (error, results) => {
                            if(error){
                                console.log(error);
                            }
                            else{
                                res.render('chat', {
                                    id: `${results[0].ID}`,
                                    name: `${results[0].Name}`,
                                    tier: `${results[0].Tier}`,
                                    room: hostRoom.cRoom,
                                    host: hostRoom.cHost
                                })
                            }
                        })
                    }
                })
            }
        })
    }
    else{
        res.redirect('/');
        return 0;
    }
}