import type { NextApiRequest, NextApiResponse } from 'next'
import User from '../../modules/User'



type Data = {
  result:string,
  id?:string|number
}


export const config = {
    api: {
      externalResolver: true,
    }
};




export default function handler(req: NextApiRequest,res: NextApiResponse<Data>){
    const {password,email} = req.body

    if(email == "" || password == ""){
      res.json({result:'false'})
      return;
    }
    var user = new User(email,password);
    user.login(req,res);

}