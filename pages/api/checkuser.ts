import type { NextApiRequest, NextApiResponse } from 'next'
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
  }) */
 
  var id = req.query.id;
  var ref = database.ref(`/users/${id}`);
  ref.once('value',snap => {
    if(!snap.exists()){
      res.json({result:'failed'})
    }else{
      res.json({result:'success'})
    }
  })

  /* con.query("SELECT * FROM users WHERE id = ?",[id],(err,result:any[]) => {
          if(err) throw err;
          if(result.length == 0){
              res.json({result:'failed'})
          }else{
              res.json({result:'success'})
          }
            
          con.end();
  }) */
    
    
}
