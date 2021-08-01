const express = require('express');
const path = require("path");
const fs = require('fs');
const mysql = require('mysql');
const dotenv = require('dotenv');
const exSession = require('express-session');
const socketio = require('socket.io');
const multer = require('multer');
const uuid = require('uuid');

const { messageFormat, previousmsgFormat, noticeFormat, file_ud } = require('./utils/format');
const { userJoin, getCurrentUser, userLeaves, getRoomUsers } = require('./utils/chatusers');

let app = express();
const server = require('http').createServer(app);
const io = socketio(server);

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

app.set('view engine', 'hbs');

//parse url encoded bodies sent by html form
app.use(express.urlencoded({ extended: true }));
app.use(exSession({ secret: "max", saveUninitialized: false, resave: false}));
// <- to work req.body outside upload. -> app.use(multer().any());

//parse json bodies
app.use(express.json());

//public path
const pubDir = path.join(__dirname, './public');
app.use(express.static(pubDir));
app.use('/js', express.static(__dirname + 'public/js'));

//routing
app.use('/', require('./routes/pages'));

//dotenv works
dotenv.config({ path: './.env' });

//starting server at PORT 3000
server.listen(3000, ()=>{
    console.log("Server started on 3000");
});

//socket realtime section
io.on('connection', (socket) => {
    console.log('new websocket conncetion');

    // socket section for realtime chat

    socket.on('joinRoom', ({ id, username, room }) => {
        const user = userJoin(socket.id ,id, username, room);

        socket.join(user.room);

        let sql_c = `select max(num) as max from ${user.room}`;
        db.query(sql_c , (error, results) => {
            if(error){
                console.log(error);
            }
            else{
                let sql = `select * from ${user.room}`;
                db.query(sql, (error, msg_results) => {
                    if(error){
                        console.log(error);
                    }
                    else{
                        let i;
                        for(i = 0; i < results[0].max; i++){
                            socket.emit('previousMessage', previousmsgFormat(
                                `${msg_results[i].username}`,
                                `${msg_results[i].msg}`,
                                `${msg_results[i].date}`,
                                `${msg_results[i].time}`
                            ))
                        }        
                    }
                })
            }
        })

        socket.emit('message', messageFormat('System', 'Welcome'));

        socket.broadcast.to(user.room).emit('message', messageFormat('System', `ID:${user.id} , UserName:${user.username} joined`));

        //send users and room info
        io.to(user.room).emit('roomUsers', {
            user_id: getRoomUsers(user.room)
        })
    })

    socket.on('chatMessage', ( msg ) => {
        const user = getCurrentUser(socket.id);

        let sql =`insert into ${user.room} (id, username, date, time, msg) values ?`;
        let value = [[ user.id, user.username, messageFormat(user.username, msg).date, messageFormat(user.username, msg).time, messageFormat(user.username, msg).text]];

        io.to(user.room).emit('message', messageFormat(user.username, msg));
        db.query(sql, [value], (error) => {
            if (error){
                console.log(error);
            }
            else{
                console.log('message stored successfully');
            }
        })
    })

    socket.on('disconnect', () => {
        const user = userLeaves(socket.id);
        if(user){
            io.to(user.room).emit('message', messageFormat('System', `ID: ${user.id}, UserName: ${user.username} disconnected`));

            //for disconnected removal
            io.to(user.room).emit('roomUsers', {
                user_id: getRoomUsers(user.room)
            })
        }
    })

    // socket section for realtime notice

    socket.on('newNotice', ({notice, date, user_id}) => {
        
        let sql_nn = `insert into notice (date, notice, id) values ?`;
        let value =[[ date, notice, user_id ]];
        db.query(sql_nn, [value], (error) => {
            if(error){
                console.log(error);
            }
            else{
                console.log('notice created');
            }
        })
    })

    socket.on('process_start', () => {
        let sql_autoset = `SET @count = 0;
        UPDATE notice SET notice.notice_id = @count:= @count + 1;
        
        ALTER TABLE notice AUTO_INCREMENT = 1;`
        db.query(sql_autoset, (error) => {
            if(error){
                console.log(error);
            }
        })

        let sql = `select max(notice_id) as max from notice`;
        db.query(sql, (error, results) => {
            if(error){
                console.log(error);
            }
            else{
                let NN_id = results[0].max + 1;
                socket.emit('getNN_id', NN_id);

                let sql_n = `select * from notice`;
                db.query(sql_n, (error, n_results) => {
                    if(error){
                        console.log(error);
                    }
                    else{
                        let i;
                        for(i = results[0].max-1; i >= 0; i--){
                            socket.emit('getNotice', noticeFormat(
                                `${n_results[i].notice_id}`,
                                `${n_results[i].date}`,
                                `${n_results[i].notice}`))
                        }
                    }
                })
            }
        })
    })

    socket.on('searchNotice', ({n_id, Selector}) => {
        let sql = `select notice from notice where notice_id = ${n_id}`;
        db.query(sql, (error, results) => {
            if(error){
                console.log(error);
                socket.emit('searchedNotice', 'Invalid ID, error occurred');
            }
            else{
                let notice = results[0].notice;
                console.log(Selector);
                socket.emit('searchedNotice', {notice, Selector});
            }
        })
    })

    socket.on('editedNotice', ({edit_id,notice}) => {
        let sql = `update notice set notice = '${notice}' where notice_id = ${edit_id}`;
        db.query(sql, (error) => {
            if(error){
                console.log(error);
            }
            else{
                console.log('Edited successfully');
            }
        })
    })

    socket.on('removeNotice', remove_id => {
        let sql = `delete from notice where notice_id = ${remove_id}`;
        db.query(sql, (error) => {
            if(error){
                console.log(error);
            }
            else{
                console.log('removed Successfully');
            }
        })
    })

    //file upload download system
    socket.on('fileshare_start', (UserID) => {
        let sql_autoset = `SET @count = 0;
        UPDATE upload_download SET upload_download.serial = @count:= @count + 1;
        
        ALTER TABLE upload_download AUTO_INCREMENT = 1;`
        db.query(sql_autoset, (error) => {
            if(error){
                console.log(error);
            }
        })

        let sql = `Select * FROM upload_download WHERE receiver = ?`
        db.query(sql, [UserID], (error, results) => {
            if(error){
                console.log(error);
            }
            else{
                let i=0;
                for(i=0; i< results.length; i++){
                    socket.emit('getRows', file_ud( `${results[i].serial}`, `${results[i].sender}`, `${results[i].receiver}`, `${results[i].filename}`));
                }
            }
        })
    })

    socket.on('remove_file', (s) => {
        console.log(s);
    })
})