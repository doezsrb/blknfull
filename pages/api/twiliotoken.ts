import type { NextApiRequest, NextApiResponse } from 'next'
import mysql from 'mysql'
import { VideoGrant } from 'twilio/lib/jwt/AccessToken'
const AccessToken:any = require("twilio").jwt.AccessToken

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
const twilioApiKey = process.env.TWILIO_API_KEY
const twilioApiSecret = process.env.TWILIO_API_SECRET

type Data = {
    token:string
}



export const config = {
    api: {
      externalResolver: true,
    }
};



export default function handler(req: NextApiRequest,res: NextApiResponse<Data>){
  const con = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'balkan_dating'
  })
  const email = req.body.email
  const roomName = req.body.room

  const token = new AccessToken(twilioAccountSid,twilioApiKey,twilioApiSecret)
  token.identity = email
  
  const videoGrant = new VideoGrant({
      room:roomName
  })

  token.addGrant(videoGrant)

  res.json({token:token.toJwt()})

}