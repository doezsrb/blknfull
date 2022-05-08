import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable';
import {v4 as uuidv4} from 'uuid'
import admin from 'firebase-admin'

export const config = {
    api: {
      externalResolver: true,
    }
};

const serviceAccount = require('../../serviceAccountKey.json')
if(!admin.apps.length){
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'balkan-dating.appspot.com'
    })
}else{
    admin.app()
}

const bucket = admin.storage().bucket();
const allowExt = ['image/jpeg','image/png'];

const getRandom = ():number => {
    return Math.floor((Math.random() * 100000) + 1);
}

const checkExtension = (files:any[]):boolean => {
    var err = 0;
    files.map(file => {
        if(!allowExt.includes(file.mimetype)){
            err+=1
        }
    })
    if(err != 0){
        return false;
    }else{
        return true;
    }
}

export default function handler(req: any,res: NextApiResponse<any>){

    if(!checkExtension(req.files)){
        res.json({result:'Failed'});
        return;
    }

    req.files.map((file:any) => {
      
    var ext;
    
    const uuid = uuidv4();

    switch(file.mimetype){
        case 'image/jpeg':
            ext = '.jpg'
            break;
        case 'image/png':
            ext = '.png'
            break;
    }
    const randomName = `upload/${getRandom()}-${getRandom()}-${getRandom()}-${getRandom()}${ext}`
    const blob = bucket.file(randomName);
    const blobwriter = blob.createWriteStream({
        metadata:{
            contentType:file.mimetype,
            metadata:{
                firebaseStorageDownloadTokens:uuid
            }
        }
    })
    
    blobwriter.on('error',err => {
        console.log(err)

    })
    
    blobwriter.on('finish', () => {
        console.log('Success upload')
    })
    
    blobwriter.end(file.buffer);
    })

    res.json({result:'Success'})
  

}