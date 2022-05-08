import {GetServerSideProps } from 'next'
import {useState,useEffect, useContext, useRef} from 'react'
import { useRouter} from 'next/router'
import SocketContext from '../../socketProvider'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import {connect,createLocalVideoTrack} from 'twilio-video'
import style from './videochat.module.css'
import CheckCookies from '../../modules/CheckCookies'


type UserProps = {
  id:string|number,
  email:string
}
type Props = {
  user:UserProps
}
var timestart = 0
export default function Livechat(props:Props) {
  const [muted,setMuted] = useState<Boolean>(false);
  const [discamera,setDiscamera] = useState<Boolean>(false);
  
  const worker = useRef<any>()
  const socket:any = useContext(SocketContext)
  const camera1:any = useRef<HTMLDivElement>()
  const camera2:any = useRef<HTMLDivElement>()
  const PROTOCOL = process.env.NEXT_PUBLIC_PROTOCOL;
  const HOST = process.env.NEXT_PUBLIC_HOST;
  const router:any = useRouter()
  const id = props.user.id
  const email = props.user.email
  const remoteid = router.query.id!!
  
  var conn_room:any;
  var tokenfromserver:string;
  var roomname:string = id > remoteid ? `${id}--with--${remoteid}` : `${remoteid}--with--${id}`;


function getTime(){
  let date = new Date();
  let time = date.getTime()
  return time;
}
function timeApi(){ 
  axios.post(PROTOCOL+"://"+HOST+"/api/twiliotime",{
    id1:id > remoteid ? id : remoteid,
    id2:id > remoteid ? remoteid : id,
    time:getTime(),
    starttime:timestart
  })

}
  useEffect(() => {
    worker.current = new Worker('../tokenworker.js');
    worker.current.onmessage = (obj:any) => {
        if(obj.data == 't:0') alert("T: 0");
    }

    
    createLocalVideoTrack().then((track:any) => {
      camera1.current.innerHTML = ""
      camera1.current.appendChild(track.attach())
    })
    
    
    axios.post(PROTOCOL+"://"+HOST+"/api/twiliotoken",{
        email:email,
        room:roomname
    }).then(data => {
        tokenfromserver = data.data.token
        connect(tokenfromserver,{audio:true,name:roomname,video:{width:640}}).then(room => {

            window.onbeforeunload = () => room.disconnect()

            if(conn_room == undefined) conn_room = room
            
            room.participants.forEach(participant => {
              participant.tracks.forEach((publication:any) => {
                if (publication.track) {
                  camera2.current.appendChild(publication.track.attach());
                }
              });
            
             participant.on('trackSubscribed', (track:any) => {
                
                camera2.current.appendChild(track.attach());
              });
            });
            /*
            function handleTrackEnabled(track:any) {
              track.on('enabled', () => {
                console.log(track)
                if(track.kind == "video"){
                  
                  camera2.current.appendChild(track.attach());
                }
                  
              });
            }
            
            room.participants.forEach(participant => {
              participant.tracks.forEach(publication => {
                if (publication.isSubscribed) {
                  handleTrackEnabled(publication.track);
                }
                publication.on('subscribed', handleTrackEnabled);
              });
            });


            function handleTrackDisabled(track:any){
              track.on("disabled", () => {
                console.log(track)
                if(track.kind == "video"){
                  camera2.current.innerHTML = ""
                }
              
                
              })
            }
            room.participants.forEach(participant => {
              participant.tracks.forEach(publication => {
                if (publication.isSubscribed) {
                  handleTrackDisabled(publication.track);
                }
                publication.on('subscribed', handleTrackDisabled);
              });
            });
              */

            


            room.on('participantConnected',(participiant:any) => {
                timeApi()
                timestart = getTime()
                var obj = {
                  token:1000,
                  type:'video'
                }
                worker.current.postMessage(obj)

                participiant.tracks.forEach((publication:any) => {
                  if(publication.isSubscribed){
                    const track:any = publication.track
                    camera2.current.appendChild(track.attach())
                  }
                })
                participiant.on('trackSubscribed', (track:any) => {
                  
                  camera2.current.appendChild(track.attach())
                })
                
            })


            room.on('participantDisconnected', participant => {
              timeApi()
              worker.current.terminate();
              camera2.current.innerHTML = ""
            });
            
        }, error => console.error(error))
    }).catch(e => console.error(e))
    
   
  },[])



  function mute(){
    if(!muted){
      conn_room.localParticipant.audioTracks.forEach((pub:any) => {
        pub.track.disable();
      })
      
    }else{
      conn_room.localParticipant.audioTracks.forEach((pub:any) => {
        pub.track.enable();
      })
    }
    
    setMuted(!muted)
  }
  function disableCamera(){
    
    if(!discamera){
      conn_room.localParticipant.videoTracks.forEach((pub:any) => {
        pub.track.disable();
      });
    }else{
      conn_room.localParticipant.videoTracks.forEach((pub:any) => {
        pub.track.enable();
      });
    }
    setDiscamera(!discamera)
  }
  
    return (
      <>
      <button onClick={mute}>Mute</button>
      <button onClick={disableCamera}>Camera</button>
      <div className={style.container}> 
          
          <div ref={camera1} ></div> 
          <div ref={camera2} ></div>
          
      </div>
      </>
    )
  }

  export const getServerSideProps :GetServerSideProps = async(context:any) => {
      const remote_id = context.query.id;
      const checkCookies = new CheckCookies(context.req,context.res,remote_id);

      if(context.req.method != 'POST'){
        checkCookies.redirect();
      }

      const {token} = context.req.body;
      checkCookies.checkVideoToken(token);
      checkCookies.checkCookie();

      return {
        props:{
          user:checkCookies.userProp
        }
      }
  }