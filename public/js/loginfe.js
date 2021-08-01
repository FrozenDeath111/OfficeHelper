const Submit = document.getElementById('submit');
const Form = document.getElementById('login-form');
const UserID = document.getElementById('userid');
const Password = document.getElementById('password');

document.body.onload = () => {Refresh()};

function Refresh(){
    UserID.value = '';
    Password.value = '';
}