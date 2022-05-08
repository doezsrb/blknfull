import axios from "axios"
import {useRef, useContext, useEffect, useState } from "react"
import Cookies from 'cookies'
import io from 'socket.io-client'
import SocketContext from "../socketProvider"
import {GetServerSideProps } from 'next'

import jwt from 'jsonwebtoken'

export default function Register(props:any) {
    const id = props.user.id;
    const loginname = props.user.name;
    const PROTOCOL = process.env.NEXT_PUBLIC_PROTOCOL;
    const HOST = process.env.NEXT_PUBLIC_HOST;
    const SECRET:any = process.env.NEXT_PUBLIC_TOKENSECRET;
    const postredirect:any = useRef()
    const tokeninput:any = useRef();
    const [name,setName] = useState("")
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [gender,setGender] = useState("male")
    const [loginMail,setLoginmail] = useState("")
    const [loginPassword,setLoginpassword] = useState("")
    const [showPopupRequest,setShowPopupRequest] = useState(false);
    const [showPopupLoading,setShowPopupLoading] = useState(false);
    const [getReqId,setReqId] = useState('');
    const socket:any = useContext(SocketContext)
    
    useEffect(()=>{
        
         
        socket.on('call_req',(args:any) => {
            setShowPopupRequest(true)
            setReqId(args.id)
            //Prikazi ime (args.name)
        })

        socket.on('call_declined',(args:any) => {
            setShowPopupLoading(false);
            
        })

        socket.on('call_accepted',(args:any) => {
        create_token()
        postredirect.current.action = `/videochat/${args.remote_id}`
        postredirect.current.submit();
           
        });
        socket.on('call_stopped',(args:any) => {
            setShowPopupRequest(false);
        })
        
      
        
    },[])
    function loginMethod(){
        axios.post(PROTOCOL+'://'+HOST+'/api/login',{
            email:loginMail,
            password:loginPassword
        }).then((res:any) => {
            if(res.data.result == "success"){
                socket.emit('addonline',{userid:res.data.id})
                alert("Success")
            }else{
                alert("Failed")
            }
        }).catch(e => console.log(e))
        
    }

    function postMethod(){
        axios.post(PROTOCOL+'://'+HOST+'/api/register',{
            name:name,
            gender:gender,
            email:email,
            password:password
        }).then((res:any) => {
            if(res.data.result == "success"){
                alert("Success")
            }else{
                alert("Failed")
            }
        }).catch(e => console.log(e))
       
    }

    function logoutMethod(){
        socket.emit('offline')
        document.cookie = 'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        location.reload();
    }
    function uploadImg(e:any){
        e.preventDefault()
        console.log(e.target["img"].files[0])
        var formData:any = new FormData();
        formData.append('img',e.target["img"].files[0])
        axios.post(PROTOCOL+"://"+HOST+"/api/uploadimg",formData)
    }

    function create_token(){
        let token = jwt.sign({
            exp:Math.floor(Date.now()/1000)+(1*60),
            data:id
        },SECRET);
        tokeninput.current.value = token;
    }


    function call_accept(){
        let args = {
            id:getReqId,
            remote_id:id
        }
        socket.emit('call_accept',args);
        create_token()
        postredirect.current.action = `/videochat/${getReqId}`
        postredirect.current.submit();
        
    }

    function call_decline(){
        let args = {
            remote_id:getReqId,
            id:id
        }
        socket.emit('call_decline',args)
        setShowPopupRequest(false)
    }
    
    function call_start(remote_id:string){
        setReqId(remote_id);
        let args = {
            remote_id:remote_id,
            id:id,
            name:loginname
        }
        socket.emit('call',args)
        setShowPopupLoading(true);
    }
    function call_stop(){
        let args = {
            remote_id:getReqId
        }
        socket.emit('call_stop',args);
       
        setShowPopupLoading(false);
    }
    return (
      <>
        {showPopupRequest ? <div style={{backgroundColor:'lightgray',padding:'50px',position:'fixed',marginLeft:'40%'}}>
            <div onClick={call_accept} style={{float:'left',width:'100px',height:'50px',backgroundColor:'green'}} ></div>
            <div onClick={call_decline} style={{float:'right',width:'100px',height:'50px',backgroundColor:'red'}}></div>
        </div> : null}
        {showPopupLoading ? <div style={{backgroundColor:'lightgray',padding:'50px',position:'fixed',marginLeft:'40%'}}>
            <h1>...</h1>
            <button onClick={call_stop}>Close</button>
        </div> : null}
        <h1>Register</h1>
        <div style={{display:'flex',flexDirection:'column',width:'20%'}}>
        <label>Male</label>
        <input type="radio" onChange={(e)=>setGender(e.target.value)} name="gender" checked={gender == "male"} value="male" />
        <label>Female</label>
        <input type="radio" onChange={(e)=>setGender(e.target.value)} name="gender" checked={gender == "female"} value="female" />
        <input type="text" onChange={(e)=>setName(e.target.value)} name="name" value={name} placeholder="name" />
        <input type="email" onChange={(e)=>setEmail(e.target.value)} name="email" value={email} placeholder="email" />
        <input type="password" onChange={(e)=>setPassword(e.target.value)} name="password" value={password}  placeholder="password"/>
        <button onClick={postMethod}>post</button>
        <hr />
        </div>
        <input type="email" onChange={(e)=>setLoginmail(e.target.value)} name="email" value={loginMail} placeholder="email" />
        <input type="password" onChange={(e)=>setLoginpassword(e.target.value)} name="password" value={loginPassword}  placeholder="password"/>
        <button onClick={loginMethod}>login</button>
        <button onClick={logoutMethod}>logout</button>
        <br />
        <form  onSubmit={(e)=>uploadImg(e)} encType="multipart/form-data">
        <input type="file" name="img" />
        <button type="submit">Upload img</button>
        </form>
        <hr />
        <button onClick={()=>call_start('-Mh97cak5os4cjSpP1R7')}>CALL 8 ID</button>
        <button onClick={()=>call_start('-Mh8-UKRGfFEDSi0bq6U')}>CALL 7 ID</button>
        <hr />



        <form ref={postredirect} method="POST" action="" style={{display:"none"}}>
            <input ref={tokeninput} type="hidden" name="token" />
        </form>
        

        
      </>
    )
  }

  export const getServerSideProps :GetServerSideProps = async(context) => {
     
    function redirect():void{
          context.res.setHeader("location", "/");
          context.res.statusCode = 302;
          context.res.end();
    }

    const remote_id = context.query.id;
    var userProp:object = {};
    var cookies = new Cookies(context.req,context.res)
    const token = cookies.get("auth-token")
    const secret = "testbalkandatinsecret"
    if(token == undefined){
        userProp = {
            email:"ironlakdoes@gmail.com",
            id:8,
            name:'Test'
          }
      
    }else{
      jwt.verify(token,secret,(err,decoded:any) => {
        if(err){
          redirect()
        }else{
          if(remote_id == decoded.id){
            redirect()
          }
          userProp = {
            email:decoded.email,
            id:decoded.id,
            name:decoded.name
          }
        }
      })

    }
    
      return {
          props:{
              user:userProp
          }
      }
}