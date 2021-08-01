const moment = require('moment');
const d = new Date();

function messageFormat(username, text){
    return{
        username,
        text,
        date: d.toLocaleDateString(),
        time: moment().format('h:mm a')
    }
}

function previousmsgFormat(username, text, date, time){
    return{
        username,
        text,
        date,
        time
    }
}

function noticeFormat(notice_id, date, notice){
    return{
        notice_id,
        date,
        notice
    }
}

function file_ud(serial, sender, receiver, filename){
    return{
        serial,
        sender,
        receiver,
        filename
    }
}

module.exports = {
    messageFormat,
    previousmsgFormat,
    noticeFormat,
    file_ud
}