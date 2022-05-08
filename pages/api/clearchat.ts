import type { NextApiRequest, NextApiResponse } from 'next'
import database from '../../db';
import Cookies from 'cookies'
import jwt from 'jsonwebtoken'
type Data = {
  result:string
}

export const config = {
  api: {
    externalResolver: true,
  }
};

export default function handler(req: NextApiRequest,res: NextApiResponse<Data>) {
    var id;
    function redirect():void{
        res.setHeader("location", "/");
        res.statusCode = 302;
        res.end();
    }
    var cookies = new Cookies(req,res)
    const authtoken = cookies.get("auth-token")
    const secret = process.env.COOKIESECRET;
    if(authtoken == undefined){
        redirect()
       }else{
         jwt.verify(authtoken,secret!,(err,decoded:any) => {
           if(err){
             redirect()
           }else{
             id = decoded.id;
           }
         })
       }
    const {remoteid} = req.body;
    const u1_u2 = `${id}_${remoteid}`;
    const ref = database.ref('livechat');
    
    ref.orderByChild('user1_user2').equalTo(u1_u2).once('value',(snap:any) => {
       if(snap.exists()){
        var deleteObj:any = {}
        snap.forEach((child:any) => {
            deleteObj[child.key] = null
        })
        ref.update(deleteObj,()=>{
            res.json({result:'Success'});
        });
       }else{
           res.json({result:'Success'});
       }
    })
    

   
}

