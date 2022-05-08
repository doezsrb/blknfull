import type { NextApiRequest, NextApiResponse } from 'next'
import Cookies from 'cookies'
import jwt from 'jsonwebtoken'
import CookiesJS from 'js-cookie'
export default class CheckCookies{
    SECRET = process.env.COOKIESECRET;
    CLIENT_SECRET = process.env.NEXT_PUBLIC_COOKIESECRET;
    TOKENSECRET:any = process.env.TOKENSECRET;

    req:NextApiRequest;
    res:NextApiResponse;

    userProp:any = null;
    remoteid?:any;

    server_cookies:any;
    client_cookies:any;

    redirect():void{
        this.res.setHeader("location", "/");
        this.res.statusCode = 302;
        this.res.end();
    }
     
    constructor(req?: any,res?: any,remoteid?:any){
        this.req = req;
        this.res = res;
        this.remoteid = remoteid;
        this.client_cookies = CookiesJS;
        this.server_cookies = new Cookies(req,res); 
    }

    checkVideoToken(token:any){
        jwt.verify(token,this.TOKENSECRET,(err:any,decoded:any) => {
            if(err){
              this.redirect();
            }
        })
    }
    checkCookie(){
      const token = this.server_cookies.get("auth-token")
      
      if(token == undefined){
        this.redirect()
       }else{
         jwt.verify(token,this.SECRET!,(err:any,decoded:any) => {
           if(err){
             this.redirect()
           }else{
             if(this.remoteid != undefined){
                if(this.remoteid == decoded.id){
                    this.redirect()
                }
             }
             this.userProp = {
               email:decoded.email,
               id:decoded.id
             }
           }
         })
 
       }
    }
    setCookie(email:string,id:number|string,name:string){
        const token = jwt.sign({email:email,id:id,name:name},this.SECRET!)
        this.server_cookies.set('auth-token',token,{
            httpOnly:false,
            sameSite:'lax'
        })
    }
    socketCookie(socket:any){
        const token = this.client_cookies.get("auth-token");
        
        if(token != undefined){
            jwt.verify(token,this.CLIENT_SECRET!,(err:any,decoded:any) => {
                if(!err){
                  
                  socket.emit('addonline',{userid:decoded.id})
                }
            })
          }
    }
}