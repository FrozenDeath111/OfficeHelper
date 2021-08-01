const Create_new = document.getElementById('create-new');
const forEdit = document.getElementById('for-edit');
const forRemove = document.getElementById('for-remove');
const searchEdit = document.getElementById('s-for-edit');
const searchRemove = document.getElementById('s-for-remove');
const New = document.getElementById('new');
const Edit = document.getElementById('edit');
const Remove = document.getElementById('remove');
const Tier = document.getElementById('tier').innerHTML;
const Main_section = document.getElementById('main-sec');
const Edit_one = document.getElementById('edit-one');
const Remove_one = document.getElementById('remove-one');

let D = new Date();
let Notice_date = D.toLocaleDateString();

let activator_create = 0;
let activator_edit = 0;
let activator_remove = 0;

Edit.onclick = () => {ToggleEdit()}
New.onclick = () => {ToggleNew()};
Remove.onclick = () => {ToggleRemove()};
document.getElementById('date_new').value = Notice_date;

window.onload = () => {Edit_Remove_Permission(Tier)};

// <-- Socket Section Start -->

//socket section
const socket = io();

//starting process
socket.emit('process_start');

//setting notice id for new
socket.on('getNN_id', NN_id => {
    document.getElementById('notice_id_new').value = `${NN_id}`;
})

//Gettings Notices from DB
socket.on('getNotice', notices => {
    outputNotice(notices);
})

//searched Notice
socket.on('searchedNotice', ({notice, Selector}) => {
    console.log(Selector);
    showNotice(notice, Selector);
})

//event listner for add notice
Create_new.addEventListener('submit', (e) => {
    e.preventDefault();

    //get notice text
    const notice = e.target.elements.notice.value;
    const date = e.target.elements.date_new.value;
    const user_id = e.target.elements.user_id_new.value;

    //emit to server
    socket.emit('newNotice', {notice, date, user_id});

    //renew after input
    renew_Section();
    socket.emit('process_start');

    //clear input
    e.target.elements.notice.value = '';
})

//for determining remove or edit
let Selector;

//event listner for search and edit notice
let edit_id;
searchEdit.addEventListener('submit', (e) => {
    e.preventDefault();

    //get notice using id
    const n_id = e.target.elements.notice_id_edit.value;
    edit_id = n_id;
    Selector = true;

    socket.emit('searchNotice', {n_id, Selector});
})

forEdit.addEventListener('submit', (e) => {
    e.preventDefault();

    const notice = e.target.elements.edited_notice.value;

    //edited notice
    socket.emit('editedNotice', {edit_id,notice});

    //renew after input
    renew_Section();
    socket.emit('process_start');
})

//event listner for search and remove notice
let remove_id;
searchRemove.addEventListener('submit', (e) => {
    e.preventDefault();

    //get notice using id
    const n_id = e.target.elements.notice_id_remove.value;
    remove_id = n_id;
    Selector = false;

    socket.emit('searchNotice', {n_id, Selector});
})

forRemove.addEventListener('submit', (e) => {
    e.preventDefault();

    if(confirm('This will delete the notice!')){
        socket.emit('removeNotice', remove_id);

        //renew after input
        renew_Section();
        socket.emit('process_start');
    }
    else{
        alert('Aborted');
    }
})


function outputNotice(notice){
    const div = document.createElement('div');
    div.classList.add('inserted');

    div.innerHTML = `
        <div class="id-date">
            <span>Notice ID : ${notice.notice_id}</span><span>Date : ${notice.date}</span>
        </div>
        <div class="notice">
            <div class="notice-text">
                <p>${notice.notice}</p>
            </div>
        </div>`;

    document.querySelector('.show-sec').appendChild(div);
}

function showNotice(notice, Selected){
    if(Selected){
        document.getElementById('edited_notice').value = `${notice}`;
    }
    else{
        document.getElementById('removed_notice').value = `${notice}`;
    }
}

function renew_Section(){
    Main_section.removeChild(document.getElementsByClassName('show-sec')[0]);

    const section = document.createElement('section');
    section.classList.add('show-sec');

    Main_section.appendChild(section);
}

// <-- Socket Section End -->

function ToggleEdit (){
    if(activator_edit == 0){
        Edit_one.setAttribute('style', 'display: flex');
        Edit.setAttribute('style', "background: radial-gradient( rgba(255, 255, 255, 0.6),rgba(62, 82, 255, 0.8));");
        Edit.innerHTML="<span>Stop<span>";
        activator_edit = 1;
        console.log('works_edit');
    }
    else{
        Edit_one.setAttribute('style', 'display: none');
        Edit.setAttribute('style', "background: radial-gradient( rgba(255, 255, 255, 0.6),rgba(255, 255, 255, 0.8));");
        Edit.innerHTML="<span>Edit<span>";
        activator_edit = 0;
        console.log('works_edit');
    }
}

function ToggleNew (){
    if(activator_create == 0){
        Create_new.setAttribute('style', 'display: flex');
        New.setAttribute('style', "background: radial-gradient( rgba(255, 255, 255, 0.6),rgba(62, 82, 255, 0.8));");
        New.innerHTML="<span>Stop<span>";
        activator_create = 1;
        console.log('works_new');
    }
    else{
        Create_new.setAttribute('style', 'display: none');
        New.setAttribute('style', "background: radial-gradient( rgba(255, 255, 255, 0.6),rgba(255, 255, 255, 0.8));");
        New.innerHTML="<span>Create<span>";
        activator_create = 0;
        console.log('works_new');
    }
}

function ToggleRemove (){
    if(activator_remove == 0){
        Remove_one.setAttribute('style', 'display: flex');
        Remove.setAttribute('style', "background: radial-gradient( rgba(255, 255, 255, 0.6),rgba(62, 82, 255, 0.8));");
        Remove.innerHTML="<span>Stop<span>";
        activator_remove = 1;
        console.log('works_remove');
    }
    else{
        Remove_one.setAttribute('style', 'display: none');
        Remove.setAttribute('style', "background: radial-gradient( rgba(255, 255, 255, 0.6),rgba(255, 255, 255, 0.8));");
        Remove.innerHTML="<span>Remove<span>";
        activator_remove = 0;
        console.log('works_remove');
    }
}

function Edit_Remove_Permission (Tier){
    if(Tier !== '01'){
        New.setAttribute('style', 'display: none;');
        Edit.setAttribute('style', 'display: none;');
        Remove.setAttribute('style', 'display: none;');
        let i, lnER = Edit_remove.length;
        for(i = 0; i < lnER; i++){
            Edit_remove[i].setAttribute('style', 'display: none;');
        }
    }
}