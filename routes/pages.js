const express = require('express');
const authControl = require('./login');
const roomCon = require('./tochat');
const infoTransfer = require('./info');
const up_down = require('./up_down');

const route = express.Router();
let firstActi = 0;
let roomActi = 0;

route.get('/', (req, res) => {
    authControl.id = null;
    if(firstActi == 0){
        req.session.success = true;
        firstActi = 1;
    }
    res.render('index', {
        title: "login validation",
        success: req.session.success,
        error: req.session.error
    });
    req.session.success = true;
    req.session.error = null;
})

route.get('/room/:id', (req, res) => {
    if(roomActi == 0){
        req.session.success = true;
        roomActi = 1;
    }
    res.render('room', {
        title: "room validation",
        success: req.session.success,
        error: req.session.error,
        id: req.params.id
    })
    req.session.success = true;
    req.session.error = null;
})

route.get('/notice/:id', (req, res) => {
    if(!authControl.id){
        res.redirect('/');
        return 0;
    }
    else if(authControl.id == req.params.id){
        res.render('notice', {
            id: req.params.id,
            tier: infoTransfer.Tier,
            username: infoTransfer.Username
        });
    }
    else{
        res.redirect('/');
        return 0;
    }
})

route.get('/fileshare/:id', (req, res) => {
    if(!authControl.id){
        res.redirect('/');
        return 0;
    }
    else if(authControl.id == req.params.id){
        res.render('fileshare', {
            id: req.params.id,
            tier: infoTransfer.Tier,
            username: infoTransfer.Username
        });
    }
    else{
        res.redirect('/');
        return 0;
    }
});

route.get('/file_error_page/:id', (res, req) => {
    const id = req.params.id;
    console.log(req.params.id);

    setTimeout(() => {
        res.redirect(`/fileshare/` + id);
    }, 2000)
})

route.get('/main/:id', infoTransfer.main_with_id);
route.get('/chat/:id/:room/:host', infoTransfer.chat_with_room_host);
route.get('/download/:id', up_down.downloads);
route.get('/removeFile/:serial/:receiver/:filename', up_down.removeFile)

route.get('/main', (req, res) => {
    res.render('index');
})

// All post requests
route.post('/login', authControl.main);
route.post('/chat-join', roomCon.chat);
route.post('/upload', up_down.uploads);

module.exports = route;