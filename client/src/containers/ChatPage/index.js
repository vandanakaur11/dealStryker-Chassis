import React from 'react'
import PubNub from 'pubnub'
import { PubNubProvider } from 'pubnub-react'
import PageWrapper from './pagewrapper'
import './style.css'

const pubnub = new PubNub({
  publishKey: 'pub-c-52a85dfa-7124-4c33-9a53-d9165416ac22',
  subscribeKey: 'sub-c-d6be03d2-3337-11ec-b2c1-a25c7fcd9558',
})

const ChatPage = (props) => {
  return (
    // <PubNubProvider client={pubnub} {...props}>
    <PageWrapper {...props}></PageWrapper>
    // </PubNubProvider>
  )
}

export default ChatPage
