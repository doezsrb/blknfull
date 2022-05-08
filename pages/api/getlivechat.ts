import type { NextApiRequest, NextApiResponse } from 'next'
import database from '../../db';

type Messages = {
    messages:object
}
export const config = {
  api: {

    externalResolver: true,
  }
};
export default function handler(req: NextApiRequest,res: NextApiResponse<Messages>) {

  /* const con = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'balkan_dating'
  }) */
  
  var {id,remoteid} = req.body
  var ref = database.ref('/livechat/');
  var query = `${id}_${remoteid}`
  ref.orderByChild("user1_user2").equalTo(query).once('value', (snap,err) => {
    if(err) throw err;
    if(!snap.exists()){
    res.json({messages:[]})
    }else{
    let data = Object.values(snap.val());
    res.json({messages:data})
    }
  })

  /*
  con.query("SELECT * FROM livechat WHERE user1 = ? AND user2 = ?",[id,remoteid],(err,result:any[]) => {
        if(err) throw err;
        res.json({messages:result})
        con.end();
  })
  */
    
}
