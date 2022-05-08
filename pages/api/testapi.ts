import type { NextApiRequest, NextApiResponse } from 'next'
import database from '../../db';
import nodemailer from 'nodemailer'



export const config = {
    api: {
      externalResolver: true,
    }
};




export default function handler(req: NextApiRequest,res: NextApiResponse<any>){
  const ref = database.ref('users');
  const {userid} = req.query;
  ref.orderByChild('gender').equalTo("male").orderByChild('email').once('value',snap => {
    console.log(snap.val())
  })
  res.json({result:'success'})
    
   
}