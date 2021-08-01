const users = [];

//chat joiners
function userJoin( s_id, id, username, room){
    const user = { s_id, id, username, room };
    users.push(user);
    return user;
}

//get crnt user
function getCurrentUser(id){
    return users.find(user => user.s_id === id);
}

//user leaves
function userLeaves(id){
    const index = users.findIndex(user => user.s_id === id);

    if(index !== -1){
        return users.splice(index, 1)[0];
    }
}

function getRoomUsers(room){
    return users.filter(user => user.room === room);
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeaves,
    getRoomUsers
}