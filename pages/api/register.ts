import type { NextApiRequest, NextApiResponse } from 'next'
import User from '../../modules/User'





type Data = {
  result:string
}

export const config = {
  api: {
    externalResolver: true,
  }
};



export default function handler(req: NextApiRequest,res: NextApiResponse<Data>) {

  var {name,gender,email,password} = req.body;

  if(name == "" || gender == "" || email == "" || password == ""){
    res.json({result:'Failed'})
    return;
  }
  
  var user = new User(email,password,gender,name)
  
  user.checkRegEmail().then(val => {
    user.register(res) 
  }).catch(err => {
      console.log(err)
      res.json({result:'Failed'})
  })  
}

