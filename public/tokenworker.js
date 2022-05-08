var token,seconds,chattimeout,videotimeout;



self.onmessage = msg => {
    if(msg.data.type == 'video'){
        token = msg.data.token;
        videotimer();
    }else if(msg.data.type == 'chat'){
        token = msg.data.token;
        seconds = 10;
        chattimer();
    }else{
        seconds = 10;
    }
}



const videotimer = () => {
    videotimeout = setTimeout('videotimer()',1000)
    token-=1
    if (token == 0){
        postMessage('t:0');
        clearTimeout(videotimeout)
    }
}

const chattimer = () => {
        chattimeout = setTimeout('chattimer()',1000); 
        if(seconds != 0){
            token-=1;
            seconds-=1;
            if(token == 0){
                clearTimeout(chattimeout);
                postMessage('t:0');
            }
        }
}

