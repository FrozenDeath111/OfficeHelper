const mysql = require('mysql');
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
        console.log("Connected to login");
    }
    else{
        console.log(error);
    }
})

exports.main = (req, res) => {
    try {
        const { userid, password } = req.body;

        if( !userid || !password ){
            req.session.success = false;
            res.redirect('/');
            return 0;
        }

        db.query('select * from employee where ID = ?',[userid] , (error, results) => {
            if(error){
                console.log(error);
            }
            if( results.length == 0 ){
                req.session.success = false;
                res.redirect('/');
            }
            else if( password != results[0].Password){
                req.session.success = false;
                res.redirect('/');
            }
            else{
                req.session.success = true;
                res.redirect('/main/' + userid);
                exports.id = userid;
            }
        })

    } catch (error) {
        console.log(error);
    }
}