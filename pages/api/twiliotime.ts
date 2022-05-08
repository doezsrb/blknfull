import type { NextApiRequest, NextApiResponse } from 'next'


type Data = {
    result:string
}



export const config = {
    api: {
      externalResolver: true,
    }
};



export default function handler(req: NextApiRequest,res: NextApiResponse<Data>){
 
  const {starttime,time,id1,id2} = req.body
  
  res.json({result:"Success"})

}