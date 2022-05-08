import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import database from '../db';
import CheckCookies from './CheckCookies';


const ALGORITHM = 'aes-256-ctr';
const IV_LENGTH = 16;


type Data = {
    result:string,
    id?:string|number
}

export default class User{
   /* con = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'',
      database:'balkan_dating'
    });
    */
    
    gender?:string;
    name?:string;
    email:string;
    password:any;
  
    constructor(email:string,password:any,gender?:string,name?:string){
      this.email = email;
      this.password = password;
      this.name = name;
      this.gender = gender;
    }

    register(res: NextApiResponse<Data>){
        var encryptPass = this.encrypt(this.password.toString())
        let user = {
            name:this.name,
            password:encryptPass,
            email:this.email,
            gender:this.gender
        }
        var new_row = database.ref('/users/').push();
        new_row.set(user,err => {
          if(err) throw err;
          res.json({result:'success'})
        })

        /* this.con.query("INSERT INTO users SET ?",user,(err,result) => {
          if(err) throw err;
          res.json({result:'success'})
          this.con.end()
        })*/
    }
    checkRegEmail(){
        return new Promise((resolve,reject) => {
            var ref = database.ref('users');
            ref.orderByChild("email").equalTo(this.email).once('value',snap => {
              if(snap.exists()){
                reject('Email exists');
              }else{
                resolve('Ok')
              }
            })
            /*
            this.con.query("SELECT * FROM users WHERE email = ?",[this.email],(err,result) => {
              if (err) throw err;
              if(result.length == 0){
                resolve("Ok")
              }else{
                reject("Email exists")
              }
            })
            */
        })
    }


    login(req: NextApiRequest,res: NextApiResponse<Data>){
      this.checkEmail().then((result:any) => {
        const encPass = result.data.password;
        const decPass = this.decrypt(encPass)
        const id = result.id;
        const name = result.data.name;
        this.checkPassword(name,decPass,id,req,res)
      }).catch(e => {
      
        console.log(e)
        res.json({result:'Failed'})
      
      })
    }
    checkEmail(){
        return new Promise((resolve,reject) => {
          var ref = database.ref('users');
          ref.orderByChild('email').equalTo(this.email).once('value',snap => {
            
            if(snap.exists()){
              let data = Object.values(snap.val());
              let key = Object.keys(snap.val());
              var args = {
                data:data[0],
                id:key[0]
              }
              
              resolve(args)
            }else{
              reject("Email not exists!");
            }
          })
          /*
          this.con.query("SELECT * FROM users WHERE email = ?",[this.email],(err,result) => {
            if (err) throw err;
            if(result.length != 0){
              resolve(result)
            }else{
              reject("Email not exists!");
            }
          })
          */
        })
    }
    checkPassword(name:string,decPass:any,id:any,req: NextApiRequest,res: NextApiResponse<Data>){
        if(decPass == this.password){
              const checkCookies = new CheckCookies(req,res);
              checkCookies.setCookie(this.email,id,name);
              res.json({result:'success',id:id})
              
        }else{
          
            res.json({result:'failed'})
            
        }
    }


     decrypt(text:any) {
      let textParts = text.split(':');
      let iv = Buffer.from(textParts.shift(), 'hex');
      let encryptedText = Buffer.from(textParts.join(':'), 'hex');
      let decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from('FoCKvdLslUuB4y3EZlKate7XGottHski1LmyqJHvUhs=', 'base64'), iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    }
     encrypt(text:any) {
        let iv = crypto.randomBytes(IV_LENGTH);
        let cipher = crypto.createCipheriv(ALGORITHM, Buffer.from('FoCKvdLslUuB4y3EZlKate7XGottHski1LmyqJHvUhs=', 'base64'), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

}