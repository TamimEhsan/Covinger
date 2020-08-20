'use strict';
const BootBot = require('bootbot');
const axios = require('axios');
const config = require('../config');
const donatePlasmaConvo = require('./conversations/donatePlasma');

const bot = new BootBot({
    accessToken: config.access_token,
    verifyToken: config.verify_token,
    appSecret: config.app_secret
});
/*
bot.on('message', (payload, chat) => {
  const text = payload.message.text;
  chat.say(`${text} too`);

});
*/
bot.setGreetingText('Hey there! Welcome to BootBot!');
bot.setGetStartedButton((payload, chat) => {
    chat.say('Welcome to BootBot. What are you looking for?');
});

bot.hear(['hello', 'hi', /hey( there)?/i], (payload, chat) => {
    chat.say('Hi there! I am Covid-19 help bot Covinger. Nice to see you. Here we seek to help you with plasma donation and recieve with higher efficiency and less errors.\n',{typing:true}).then(()=>{
        chat.say({
            text: 'How Can you help you?',
            buttons: [
                { type: 'postback', title: 'Donate Plasma', payload: 'DONATE_PLASMA' },
                { type: 'postback', title: 'Show Generic Cards', payload: 'RECIEVE_PLASMA' },
                { type: 'web_url', title: 'Visit Google', url: 'https://www.google.com/', messenger_extensions: "FALSE", }
            ],
        },{typing:true});
    });

});

bot.on('postback:DONATE_PLASMAr', (payload, chat) => {
    chat.say({
        cards: [
            { title: 'Article 1', image_url: 'https://www.w3schools.com/w3css/img_lights.jpg', default_action: { type: 'web_url' , url: 'https://www.google.com/' } },
            { title: 'Article 2', image_url: 'https://www.w3schools.com/w3css/img_snowtops.jpg', default_action: { type: 'web_url', url: 'https://www.google.com/' } }
        ]
    });
});

bot.on('postback:RECIEVE_PLASMA',(payload,chat)=>{
    const element = {
        "title":"Header Text",
        "image_url":"https://www.w3schools.com/w3css/img_lights.jpg",
        "subtitle":"Sub title text",
        "default_action": {
            "type": "web_url",
            "url": "https://www.google.com/",
            "messenger_extensions": "FALSE",
            "webview_height_ratio": "COMPACT"
        },
        "buttons":[{type: 'postback', title: 'Location', payload: 'LOCATION' }]
    };
    const elements = [
            element,element
        ];
    chat.sendGenericTemplate(elements);
})
bot.on('postback:LOCATION', (payload, chat) => {
    const askName = (convo) => {
        convo.ask('Whats your location', (payload, convo) => {
            console.log(payload.message)
        }, [
            {
                event: 'attachment',
                callback: (payload, convo) => {
                    const text = payload.message.attachments[0].payload["coordinates"];
                    convo.say(`Your Location is Lat: ${text.lat} and Lon: ${text.long}`)
                    console.log(text);
                    console.log("Lat: "+text.lat);
                    console.log("Long: "+text.long);
                    convo.end();
                }
            }
        ]);
    };
    chat.conversation((convo) => {
        askName(convo);
    });
});

bot.hear(['help'], (payload, chat) => {
    // Send a text message with buttons
    chat.say({
        text: 'What do you need help with?',
        buttons: [
            { type: 'postback', title: 'Settings', payload: 'HELP_SETTINGS' },
            { type: 'postback', title: 'FAQ', payload: 'HELP_FAQ' },
            { type: 'postback', title: 'Talk to a human', payload: 'HELP_HUMAN' }
        ]
    });
});



async function getLocation(text,chat){
    try{
        const response = await axios.get('https://us1.locationiq.com/v1/search.php', {
            params: {
                key: '5e137deebf37dc',
                q: text,
                format: 'json'
            }
        });
        const location = response.data[0].display_name;
        chat.say(`${location}`);
    } catch (error){
        console.log(error.message);
        const location = "Sorry, We couldn't find it";
        chat.say(`${location}`);
    }

}

bot.module(donatePlasmaConvo);
bot.start(3000);