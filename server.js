
const express = require('express')
const app = express()
const server = require("http").Server(app)
const io = require('socket.io')(server)
const next = require('next')
const { instrument } = require("@socket.io/admin-ui");
const multer = require('multer');


//FIREBASE----------------------------
const firebase = require('firebase');
const firebaseConfig = {
    apiKey: "AIzaSyD21QZgnE5ta7hzEU4oHIhhu9hFXvM7TUI",
    authDomain: "balkan-dating.firebaseapp.com",
    projectId: "balkan-dating",
    storageBucket: "balkan-dating.appspot.com",
    messagingSenderId: "1076018454998",
    databaseURL:"https://balkan-dating-default-rtdb.europe-west1.firebasedatabase.app/",
    appId: "1:1076018454998:web:45b8129108a8151c750477",
    measurementId: "G-Y3DDJRB0W9"
  };
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}else {
    firebase.app(); 
}
const database = firebase.database();
//-------------------------------------



app.use(
    express.urlencoded({
      extended: true
    })
)
app.use(express.json())


const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({dev})

const nextHandler = nextApp.getRequestHandler()

let port = 3000

const users = {}
const online = {}
const calls = {}


io.on("connection", socket => {
   

    console.log("SOCKET CONNECT")
    

    //JOIN-------------------------------
    socket.on("join",(room,id) => {
        users[socket.id] = id
        socket.join(room);
  

    });


    //ADD ONLINE--------------------------
    socket.on("addonline",user => {
         socket.user = user.userid
         if(online[user.userid]){
             online[user.userid] = online[user.userid]+1
         }else{
             online[user.userid] = 1
         }

         socket.join(user.userid);

    })

    //CALL_--------------------
    socket.on('call',args => {
        let remote_id = args.remote_id;
        let id = args.id;
        calls[id] = remote_id;
        let client_args = {
            id:id,
            name:args.name
        }
        io.to(remote_id).emit('call_req',client_args);
    })
    //CALL STOP-----------------
    socket.on('call_stop',args => {
        let remote_id = args.remote_id;
        io.to(remote_id).emit('call_stopped')
    })

    //CALL DECLINE--------------
    socket.on('call_decline',args => {
        io.to(args.remote_id).emit('call_declined',args);
    })

    //CALL ACCEPT-----------

    socket.on('call_accept',args => {
        io.to(args.id).emit('call_accepted',args); 
    })






    //OFFLINE------------------------
    socket.on("offline",()=>{
        delete online[socket.user];
    })



    //LIVECHAT---------------------------
    socket.on("livechat",(msg,userid,remote_id,room) => {
        /* const con = mysql.createConnection({
            host:'localhost',
            user:'root',
            password:'',
            database:'balkan_dating'
        })
        */
        /*  var values = [
            [msg,userid,remote_id,userid],
            [msg,remote_id,userid,userid]
        ] 
        */
       
        const ref = database.ref('livechat');
        const lastref = database.ref('lastchat');
        
        const obj_lastmsg = {}
        const id_lastmsg_sender = `${userid}_${remote_id}`;
        const id_lastmsg_remote = `${remote_id}_${userid}`;
        obj_lastmsg[id_lastmsg_sender] = {
            message:msg,
            userid:userid,
            remoteid:remote_id,
            seen:1
        }
        obj_lastmsg[id_lastmsg_remote] = {
            message:msg,
            userid:remote_id,
            remoteid:userid,
            seen:0
        }
        
        lastref.update(obj_lastmsg,err => {
            if(err) throw err;
        });
 


        const key1 = Math.floor(Math.random() * 100000*100000);
        const key2 = Math.floor(Math.random() * 100000*100000);
        const obj = {}
        obj[key1] = {
            message:msg,
            sender_id:userid,
            user1_user2:userid+"_"+remote_id
        }
        obj[key2] = {
            message:msg,
            sender_id:userid,
            user1_user2:remote_id+"_"+userid
        }
        ref.update(obj,err=>{
            if(err) throw err;
        })
        /* con.query("INSERT INTO livechat (message,user1,user2,sender_id) VALUES ?",[values],(err,result) => {
            if(err) throw err;
            con.end()
        });
        */
        
        var sendObj = {
            msg:msg,
            userid:userid
        }
        io.to(room).emit("livechat",sendObj)
    })
    socket.on('refreshworker',args => {
        var remote_id = args.remote_id;
        var id = args.id;
        io.to(remote_id).to(id).emit('refreshworker_client');
    });

    
    
    //DISCONNECTING-------------------
    socket.on("disconnecting",function(){
        console.log("DISCONNECT")


        if(calls[socket.user] != undefined){
            io.to(calls[socket.user]).emit('call_stopped');
            delete calls[socket.user];
        }


        if(online[socket.user] != undefined){
            if(online[socket.user] == 1){
                delete online[socket.user]
            }else{
                online[socket.user] = online[socket.user]-1
            }
        }
        delete users[socket.id]
    })
    
})
instrument(io, {
    auth: false
});


const upload = multer({
    storage:multer.memoryStorage()
})

nextApp.prepare().then(() => {

    app.get('*',(req,res) => {
        return nextHandler(req,res)
    })

    app.post('/api/uploadimg',upload.array('files'),(req,res) => {
        return nextHandler(req,res)
    })

    app.post('*',(req,res) => {
        return nextHandler(req,res)
    })

    server.listen(port, err => {
        if(err) throw err;
        console.log("READY ON PORT : "+port)
    })
})

