const FileUpload = document.getElementById('file-upload');
const FileName = document.getElementById('file-name');
const Table = document.getElementById('table');
const UserID = document.getElementById('from').value;

// get filename in place
FileUpload.onchange = () => {SetFilename(FileUpload.value)};

function SetFilename (str){
    let filename = str.replace(/^.*[\\\/]/, '');
    FileName.value = filename;
}

// socket section
const socket = io();

window.onload = () => {
    // starting process
    socket.emit('fileshare_start', UserID);
};

// show table datas
socket.on('getRows', (Datas) => {
    outputRows(Datas);
})

// output datas
function outputRows (Datas){
    const iconD = `<img src="./icons/icons8-download-16.png" alt="downlaod">`;
    const iconR = `<img src="./icons/icons8-trash-16.png" alt="downlaod">`;

    const Table_body = document.createElement('tbody');
    Table_body.innerHTML = `
        <tr>
            <form action="/download/${Datas.receiver}" id="formid1${Datas.serial}" method="get">
            <input type="text" class="data-input" form="formid1${Datas.serial}" style="display: none;" name="filename" value="${Datas.filename}" readonly>
            <input type="text" class="data-input" form="formid1${Datas.serial}" style="display: none;" name="sender" value="${Datas.sender}" readonly>
            </form>
            <td>${Datas.filename}</td>
            <td>${Datas.sender}</td>
            <td><button class="data-btn" form="formid1${Datas.serial}" type="submit">${iconD}</button></td>
            <form action="/removeFile/${Datas.serial}/${Datas.receiver}/${Datas.filename}" id="formid2${Datas.serial}" method="get">
            <input type="text" style="display: none;" form="formid2${Datas.serial}" id="serial${Datas.serial}" name="fileno" value="${Datas.serial}">
            </form>
            <td><button class="data-btn" form="formid2${Datas.serial}" id="btn${Datas.serial}" type="submit">${iconR}</button></td>
        </tr>
    `;
    Table.appendChild(Table_body);
}