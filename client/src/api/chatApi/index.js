// import {URL} from '../index'

import axios from 'axios'

var AlternatorPath = process.env.Alternator;

const httpAlternator = axios.create({
    baseURL: AlternatorPath || "https://alternator-staging.herokuapp.com"
    // 'https://dealstryker-alternator.herokuapp.com/', // for testing
})

const makeChatApi = ({client, headersManager}) => ({
    addChannel: (data) => httpAlternator.post(`/add-channel`, {
        user: {
            ...data
        }
    }, { // headers: headersManager.getHeaders(),
    },),

    getChannel: (email) => httpAlternator.get(`/list-channels/${email}`, { // headers: headersManager.getHeaders(),
    }),
    getChat: (data) => httpAlternator.get(`/history-chat`, {
        headers: {
            'Content-Type': 'application/json'
        },
        params: {
            user: {
                ...data
            }
        }
    }),
    requestOTD: (data,) => {
        console.log('THEE ADKLASJDK AS', data)
        return httpAlternator.post(`/request-chat-otd/${
            data.channelId
        }`,
        {
            user: {
                ...data
            }
        }, { // headers: headersManager.getHeaders(),
        },)
    },
    sendOTD: (data,) => {
        console.log('THEE ADKLASJDK AS', data)
        return httpAlternator.post(`/post-chat-otd/${
            data.channelId
        }`,
        {
            user: {
                ...data
            }
        }, { // headers: headersManager.getHeaders(),
        },)
    },  
    sendChat: (data) => {
        console.log('THEE ADKLASJDK AS', data)
        return httpAlternator.post(`/add-chat/${
            data.channelId
        }`, {
            user: {
                ...data
            }
        }, { // headers: headersManager.getHeaders(),
        },)
    },
    getFileUrl: (data) => {
        console.log('THEE ADKLASJDK AS', data)
        return httpAlternator.post(`/get-filelink/${
            data.channel
        }`, {
            user: {
                ...data
            }
        }, { // headers: headersManager.getHeaders(),
        },)
    }
})

export default makeChatApi
