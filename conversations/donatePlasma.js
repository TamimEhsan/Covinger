module.exports = (bot) =>{
    bot.on('postback:DONATE_PLASMA', (payload, chat) => {
        chat.conversation((convo) => {
            convo.getUserProfile().then(profile=>{
              convo.set('profile',profile)
              convo.sendTypingIndicator(1000).then(() => askSex(convo));
            })

        });
    });

    /*const namePrompt = (convo) => {
        convo.ask((convo) => {
            const buttons = [
                { type: 'postback', title: 'Male', payload: 'MALE' },
                { type: 'postback', title: 'Female', payload: 'FEMALE' }
            ];
            convo.sendButtonTemplate(`Is ${convo.getUserProfile}`,buttons);
        }, (payload, convo, data) => {
            const text = payload.message.text;
            if(text.toLowerCase() === 'female' ){
                convo.set('gender', 'female');
                askPregnancy(convo);
            } else if(text.toLowerCase() === 'male'){
                convo.set('gender', 'male');
                askAge(convo);
            } else{
                convo.say('We couldn\'t catch what you just said').then(()=> askSex(convo) );
            }

        },[
            {
                event: 'postback:MALE',
                callback: (payload, convo) => {
                    convo.set('gender','male');
                    askAge(convo);
                }
            },
            {
                event: 'postback:FEMALE',
                callback: (payload, convo) => {
                    convo.set('gender','female');
                    askPregnancy(convo);
                }
            }
        ]);
    };*/

    const askName = (convo) => {

        convo.ask((convo) => {
            convo.say(`What is your name?`, {typing: true});
        }, (payload, convo, data) => {
            const text = payload.message.text;
            convo.set('name', text);
            askSex(convo);
        });
    };

    const askSex = (convo) => {
        convo.ask((convo) => {
            const buttons = [
                { type: 'postback', title: 'Male', payload: 'MALE' },
                { type: 'postback', title: 'Female', payload: 'FEMALE' }
            ];
            convo.sendButtonTemplate('What\'s your gender?',buttons);
        }, (payload, convo, data) => {
            const text = payload.message.text;
            if(text.toLowerCase() === 'female' ){
                convo.set('gender', 0);
                askPregnancy(convo);
            } else if(text.toLowerCase() === 'male'){
                convo.set('gender', 1);
                askAge(convo);
            } else{
                convo.say('We couldn\'t catch what you just said').then(()=> askSex(convo) );
            }

        },[
            {
                event: 'postback:MALE',
                callback: (payload, convo) => {
                    convo.set('gender','male');
                    askAge(convo);
                }
            },
            {
                event: 'postback:FEMALE',
                callback: (payload, convo) => {
                    convo.set('gender','female');
                    askPregnancy(convo);
                }
            }
        ]);
    };

    const askPregnancy = (convo) => {
        convo.ask((convo) => {
            const buttons = [
                { type: 'postback', title: 'Yes', payload: 'PREGNANT' },
                { type: 'postback', title: 'No', payload: 'NOT_PREGNANT' }
            ];
            convo.sendButtonTemplate('Were you pregnant beofre or had an abortion?',buttons);
        }, (payload, convo, data) => {
            const text = payload.message.text;
            if(text.toLowerCase() === 'yes' ){
                 convo.say('Sorry, according to medical research it would be better for you if you don\'t donate plasma' +
                     '\n But Thank you for your support. Please Take care of yourself and your family. ');
                 convo.end();
            } else if(text.toLowerCase() === 'no'){
                askAge(convo);
            } else{
                convo.say('We couldn;t catch what you just said').then(()=> askPregnancy(convo) );
            }

        },[
            {
                event: 'postback:PREGNANT',
                callback: (payload, convo) => {
                    convo.say('Sorry, according to medical research it would be better for you if you don\'t donate plasma' +
                        '\n But Thank you for your support. Please Take care of yourself and your family. ');
                    convo.end();
                }
            },
            {
                event: 'postback:NOT_PREGNANT',
                callback: (payload, convo) => {
                    askAge(convo);
                }
            }
        ]);
    };

    const askAge = (convo) =>{
        convo.ask( (convo) =>{
            convo.say('How old are you?',{typing:true});
        }, (payload,chat,data) =>{
            const text = payload.message.text;
            if( isNaN(text) ){
                convo.say('That\'s not a proper age').then(()=> askAge(convo));
            } else if(text<17 || text>65){
                convo.say('Sorry, according to medical research it would be better for you if you don\'t donate plasma' +
                    '\n But Thank you for your support. Please Take care of yourself and your family. ');
                convo.end();
            } else{
                convo.set('age',text);
                askDiseases(convo);
            }

        });
    };

    const askDiseases = (convo) => {
        convo.ask((convo) => {
            const buttons = [
                { type: 'postback', title: 'Yes', payload: 'SICK' },
                { type: 'postback', title: 'No', payload: 'NOT_SICK' }
            ];
            const text = 'Do you have any kind of conditions like\n' +
                '    - heart conditions\n' +
                '    - Cancer\n' +
                '    - HIV\n' +
                '    - Hepatitis B/C or their carrier\n' +
                '    - Diabetes\n' +
                '    - Syphilis or any other STD\n' +
                '    - Drug intake\n' +
                '    - Contagious Disease\n' +
                '    - Or visited hill tracts within 2 months\n'
            convo.sendButtonTemplate(text,buttons);
        }, (payload, convo, data) => {


        },[
            {
                event: 'postback:SICK',
                callback: (payload, convo) => {
                    convo.say('Sorry, according to medical research it would be better for you if you don\'t donate plasma' +
                        '\n But Thank you for your support. Please Take care of yourself and your family. ');
                    convo.end();
                }
            },
            {
                event: 'postback:NOT_SICK',
                callback: (payload, convo) => {
                    askRecoveryDate(convo);
                }
            }
        ]);
    };

    const askRecoveryDate = (convo) =>{
        convo.ask( (convo) =>{
            convo.say('How long ago did you recover from covid-19? Input just the number of days',{typing:true});
        }, (payload,chat,data) =>{
            const text = payload.message.text;
            if( isNaN(text) ){
                convo.say('That\'s not a proper number of days').then(()=> askRecoveryDate(convo));
            }else{
                if(text<14){
                  convo.say(`Sorry, according to medical research you must recover at least 14 days before donating plasma, please come back again after ${14-text} days, thank you . `);
                  convo.end();
                }else{
                  convo.set('recoveredDate',text);
                  askBloodGroup(convo);
                }

            }
        });
    };


    const isValidBG=text=>{
      if(text.trim().toLowerCase().trim()==='a+')return true
      else if(text.trim().toLowerCase().trim()==='a-')return true
      else if(text.trim().toLowerCase().trim()==='b+')return true
      else if(text.trim().toLowerCase().trim()==='b-')return true
      else if(text.trim().toLowerCase().trim()==='ab+')return true
      else if(text.trim().toLowerCase().trim()==='ab-')return true
      else if(text.trim().toLowerCase().trim()==='o+')return true
      else if(text.trim().toLowerCase().trim()==='o-')return true
      else return false
    }


    const askBloodGroup = (convo) =>{
        convo.ask( (convo) =>{
            convo.say('What is your blood group ? (enter bloodgroup properly , for example, A+)',{typing:true});
        }, (payload,chat,data) =>{
            const text = payload.message.text;
            if(isValidBG(text)){
              convo.set('BG',text.toLowerCase().trim())
              askLocation(convo)
            }else{
              convo.say('That\'s not a proper bloodgroup (enter your bloodgroup, for example, A+)').then(()=> askBloodGroup(convo));
            }
        });
    };


    const askLocation = (convo) =>{
        convo.ask( (convo) =>{
            convo.say('What is your usual location?',{typing:true});
        }, (payload,chat,data) =>{
            const text = payload.message.text;
            // Check the blood group crieteria
            convo.set('location',text);
            showDetails(convo);
        });
    };

    const showDetails = (convo) =>{
        const details = `So, Here is what we got from you,\n`+
            `I ${convo.get('profile').first_name+' '+convo.get('profile').last_name} , ${convo.get('age')} years ${convo.get('gender')} `+
            `with blood group ${convo.get('BG')}  have no conditions that might `+
            `affect the reciever and having number of antibody `+
            `in plasma after recovering from covid for at least 14 days am willing `+
            `to donate on my free will.
        `;
        convo.say(details,{typing:true});
        convo.end();
    };

    const donatePlasmaLoop = (convo) => {
        convo.ask((convo)=>{
            convo.say(`Want to donate plasma?`,{typing:true});
        }, (payload, convo, data) => {
            const text = payload.message.text;
            convo.set('name', text);
            if( text === "no" ){
                convo.say(`Shala dibi na mane? tor bap dibe`,{typing:true}).then(() => donatePlasmaLoop(convo));
            } else if( text === "yes" ) {
                convo.getUserProfile().then((user) => {
                    convo.say(`Thank you for your cooperation ${user.first_name} ${user.last_name}`,{typing:true});
                });

                convo.end();
            }

        });
    };

};
