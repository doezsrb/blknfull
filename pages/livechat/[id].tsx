import { GetStaticProps, GetStaticPaths, GetServerSideProps } from 'next'
import {useState,useEffect, useContext,useRef} from 'react'
import { useRouter} from 'next/router'
import SocketContext from '../../socketProvider'
import Cookies from 'cookies'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import CheckCookies from '../../modules/CheckCookies'
import database from '../../db'


type Message = {
  msg:string,
  userid:string|number
}
type UserProps = {
  id:string|number,
  email:string
}
type Props = {
  user:UserProps
}

export default function Livechat(props:Props) {
  const socket:any = useContext(SocketContext)
  const PROTOCOL = process.env.NEXT_PUBLIC_PROTOCOL;
  const HOST = process.env.NEXT_PUBLIC_HOST;
  const [chat,setChat] = useState("")
  const [msgs,setMsgs] = useState<Message[]>([])
  const router = useRouter()
  const worker = useRef<any>();
  const id = props.user.id
  const remoteid = router.query.id!!
  var room:string = id > remoteid ? id+"--"+remoteid : remoteid+"--"+id


  function getAllMessages(){
    axios.post(PROTOCOL+"://"+HOST+"/api/getlivechat",{
      id:id,
      remoteid:remoteid
    }).then((data:any) => {
      let messages:any[] = data.data.messages;
      let oldMsgs:Message[] = []
      messages.map(item => {
        var message:Message = {
          msg:item.message,
          userid:item.sender_id
        }
        setMsgs(old => [...old,message])
      })
    }).catch(e => console.log(e))
  }
  function checkRemUser(){
    axios.get(PROTOCOL+"://"+HOST+"/api/checkuser?id="+remoteid).then((data:any) => {
      
      if(data.data.result != 'success'){
        router.push("/")
      }else{
        getAllMessages()
      }
    }).catch(e => console.log(e))
    
  }
  useEffect(() => {
  
    worker.current = new Worker('../tokenworker.js');
    var obj = {
      token:15,
      type:'chat'
    }
    worker.current.postMessage(obj)
    worker.current.onmessage = (obj:any) => {
      if(obj.data == "t:0") alert("Token: 0");
      
    }


    checkRemUser()
    socket.emit('join',room,id);

    socket.on("livechat",(msg:any) => {
      setMsgs(old => [...old,msg])
      
    })

    socket.on("refreshworker_client",()=>{
      var obj = {
        type:'sendchat'
      }
      worker.current.postMessage(obj);
    })
    
    return () => {
      worker.current.terminate()
    }
  },[])
 
  function sendMsg(){
    socket.emit("livechat",chat,id,remoteid,room);


    var args = {
      remote_id:remoteid,
      id:id
    }
    socket.emit("refreshworker",args);
  }
    return (
      <>
        <div style={{width:"500px",height:"200px",overflow:'hidden',background:'lightgray'}}>
          {msgs.map((item,index) => 
            <div key={index}><span  style={item.userid == id ? {color:'green',float:'right'} : {color:'red',float:'left'}}>{item.msg}</span><br /></div>
          )}
        </div>
        <input type="text" onChange={e => setChat(e.target.value)} value={chat} />
        <button onClick={sendMsg}>Send</button>
        
      </>
    )
  }

  export const getServerSideProps :GetServerSideProps = async(context) => {
    const remote_id = context.query.id;
    const checkCookies = new CheckCookies(context.req,context.res,remote_id);
    checkCookies.checkCookie();
    return {
      props:{
        user:checkCookies.userProp
      }
    }
  }