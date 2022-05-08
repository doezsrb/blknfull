import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'
import database from '../../db';
type Result = {
    result:string
}
export const config = {
  api: {
    externalResolver: true,
  }
};
export default function handler(req: NextApiRequest,res: NextApiResponse<Result>) {
    /* const con = mysql.createConnection({
        host:'localhost',
        user:'root',
        password:'',
        database:'balkan_dating'
      }); */
      
    const localemail = ""
    const localemailpass = ""
    var {email,subject,message,remoteid} = req.body

    var transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:localemail,
            pass:localemailpass
        }
    })

    var ref = database.ref('/users/'+remoteid);
    ref.once('value',snap => {
        if(snap.exists()){
            var data = snap.val();
            var mailOptions={
                from:localemail,
                to:data.email,
                subject:subject,
                text:message
            }
            transporter.sendMail(mailOptions,(err,info) => {
                if(err){
                    console.log(err)
                    res.json({result:'failed'})
                }else{
                    res.json({result:'success'})
                }
            })
        }else{
            res.json({result:'failed'});
        }
    })
    /*
    con.query("SELECT * FROM users WHERE id = ?",[remoteid],(err,result) => {
        if(err) throw err;
        var mailOptions={
            from:localemail,
            to:result[0].email,
            subject:subject,
            text:message
        }
        transporter.sendMail(mailOptions,(err,info) => {
            if(err){
                console.log(err)
                res.json({result:'failed'})
            }else{
                res.json({result:'success'})
            }
        })
    })
    */

    
}
