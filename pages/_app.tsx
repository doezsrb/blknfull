import '../styles/globals.css'
import type { AppProps } from 'next/app'
import {SocketProvider} from '../socketProvider'
import io from 'socket.io-client'
import { useEffect } from 'react'

import CheckCookies from '../modules/CheckCookies';


const socket = io();
function MyApp({ Component, pageProps }: AppProps) {
 useEffect(()=>{

  const checkCookies = new CheckCookies();
  checkCookies.socketCookie(socket);

 },[])
  return <SocketProvider value={socket}><Component {...pageProps} /></SocketProvider>
}
export default MyApp
