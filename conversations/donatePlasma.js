const Pool = require('pg').Pool

const pool = new Pool({
    user: process.env.db_user,
    host: process.env.db_host,
    database: process.env.db_db,
    password: process.env.db_pass,
    port: process.env.db_port
})






module.exports = (bot) =>{
    bot.on('postback:DONATE_PLASMA', (payload, chat) => {
        chat.conversation((convo) => {
            convo.getUserProfile().then(profile=>{
              convo.set('profile',profile)
              convo.sendTypingIndicator(1000).then(() => askSex(convo));
            })

        });
    });



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
            convo.say('How long ago did you recover from covid-19? Enter just the number of days',{typing:true});
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
            askContact(convo);
        });
    };

    const askContact = (convo) =>{
        convo.ask( (convo) =>{
            convo.say('Please provide us with your phone number or email address so that plasma recipients can contact you easily',{typing:true});
        }, (payload,chat,data) =>{
            const text = payload.message.text;
            // Check the blood group crieteria
            convo.set('contact',text);
            showDetails(convo);
        });
    };

    const showDetails = (convo) =>{
        const query = {
            text: 'INSERT INTO fbcontest(m_id,type,data,bg) VALUES($1,$2,$3,$4) returning *',
            values: [
              convo.get('profile').id,
              0,
              {
                name:convo.get('profile').first_name+' '+convo.get('profile').last_name,
                image:convo.get('profile').profile_pic,
                timestamp:Date.now(),
                age:convo.get('age'),
                location:convo.get('location'),
                contact:convo.get('contact'),
                sex:convo.get('gender'),
                recovered:convo.get('recoveredDate')
              },
              convo.get('BG')
            ]
          }
          pool.query(query).then(insRes=>{
            const details = `So, Here is what we got from you,\n`+
                `I am ${convo.get('profile').first_name+' '+convo.get('profile').last_name} , ${convo.get('age')} years old, ${convo.get('gender')}, `+
                `with blood group ${convo.get('BG').toUpperCase()} , have no conditions that might `+
                `affect the recipient(s) in a negative way, `+
                `I recovered from COVID-19 ${convo.get('recoveredDate')} days ago and am willing `+
                `to donate on my free will.
            `;
            convo.say(details,{typing:true}).then(()=>{
              convo.say("We have taken your information and will let you know if needed",{typing:true}).then(()=>{
                pool.query(`select * from fbcontest where type=1 and bg=\'${convo.get('BG')}\'`).then(res=>{
                    if(res.rows.length>0){
                      var tmpMsg='We have found some plasma-receipients matching your bloodgroup';
                      res.rows.map((row,ind)=>{
                        var des=`\n\n(${ind+1}) ${row.data.name}\n`+
                                `Blood group - ${row.bg.toUpperCase()}\n`+
                                `Age - ${row.data.age} years, ${row.data.sex}\n`+
                                `Diagnosed with COVID-19 ${row.data.affected} days ago\n`+
                                `Address - ${row.data.location}\n`+
                                `Contact - ${row.data.contact}\n`;

                        tmpMsg+=des
                      })
                      convo.say(tmpMsg,{typing:true}).then(()=>{
                        var elements=[]
                        res.rows.map(row=>{
                          var des=`Blood group - ${row.bg.toUpperCase()}\n`+
                                  `Age - ${row.data.age} years, ${row.data.sex}\n`+
                                  `Diagnosed with COVID-19 ${row.data.affected} days ago\n`+
                                  `Address - ${row.data.location}\n`+
                                  `Contact - ${row.data.contact}\n`;
                          var element = {
                              "title":row.data.name,
                              "image_url":row.data.image,
                              "subtitle":des,
                              "buttons":[
                                {type: 'postback', title: `Inform-${row.sl}-${insRes.rows[0].sl}`, payload: 'INFORM_RECEIPIENT' }
                              ]
                          };
                          elements.push(element)
                        })
                        convo.sendGenericTemplate(elements,{typing:true}).then(()=>{
                          convo.end()
                        })
                      })
                    }
                    else
                      convo.end();

                })
              })
            });
          }).catch(err=>{
            console.log(err)
          })
    };

    bot.on('postback:INFORM_RECEIPIENT', (payload, chat) => {
        var sl=payload.postback.title.split('-')[1]
        var sl1=payload.postback.title.split('-')[2]
        console.log(sl)
        pool.query('select * from fbcontest where sl='+sl).then(res0=>{
          if(res0.rows.length>0){
            pool.query('select * from fbcontest where sl='+sl1).then(res=>{
              var row=res.rows[0]
              var tmpMsg='We have found a plasma donor matching your bloodgroup';
              var des=`\n\n${row.data.name}\n`+
                      `Blood group - ${row.bg.toUpperCase()}\n`+
                      `Age - ${row.data.age} years, ${row.data.sex}\n`+
                      `Recovered from COVID-19 ${row.data.recovered} days ago\n`+
                      `Address - ${row.data.location}\n`+
                      `Contact - ${row.data.contact}\n`;
              tmpMsg+=des
              bot.sendTextMessage(res0.rows[0].m_id,tmpMsg).then(()=>{
                var des=`Blood group - ${row.bg.toUpperCase()}\n`+
                        `Age - ${row.data.age} years, ${row.data.sex}\n`+
                        `Recovered from COVID-19 ${row.data.recovered} days ago\n`+
                        `Address - ${row.data.location}\n`+
                        `Contact - ${row.data.contact}\n`;
                var element = {
                    "title":row.data.name,
                    "image_url":row.data.image,
                    "subtitle":des
                };
                bot.sendGenericTemplate(res0.rows[0].m_id,[element],{typing:true}).then(()=>{
                  chat.say(`We have sent your information to the recipient`)
                })
              })
            })

          }
        })

    });


};
