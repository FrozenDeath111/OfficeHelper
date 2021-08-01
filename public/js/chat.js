const msgFrom = document.getElementById('msg-form');
const textSec = document.querySelector('.text-sec');
const userList = document.getElementById('users');

//sending to server
const id = document.getElementById('user-id').innerHTML;
const username = document.getElementById('username').innerHTML;
const room = document.getElementById('room-name').innerHTML;

//socket section
const socket = io();

//join room
socket.emit('joinRoom', { id , username, room });

//load previous messages
socket.on('previousMessage', message => {
    outputMessage(message);  
})

//get room users
socket.on('roomUsers', ({user_id}) => {
    outputUsers(user_id);
});

socket.on('message', message => {
    outputMessage(message);

    //scroll down
    textSec.scrollTop = textSec.scrollHeight;
})

//event listner
msgFrom.addEventListener('submit', (e) => {
    e.preventDefault();

    //get msg text
    const msg = e.target.elements.msg.value;
    //emit to server
    socket.emit('chatMessage', msg);

    //clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

//output msg to DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('show_area');

    if(message.username === username){
        div.innerHTML = `
        <p class="udo">From : ${message.username} Date : ${message.date} Time: ${message.time}</p>
        <p class="msg">${message.text}</p>`;
        document.querySelector('.text-sec').appendChild(div);
    }
    else{
        div.innerHTML = `
        <p class="udt">From : ${message.username} Date : ${message.date} Time: ${message.time}</p>
        <p class="msg">${message.text}</p>`;
        document.querySelector('.text-sec').appendChild(div);
    }
    
}

function outputUsers(user_id){
    userList.innerHTML = `
        ${user_id.map(user_id => `<li>${user_id.id}</li>`).join()}
    `
}