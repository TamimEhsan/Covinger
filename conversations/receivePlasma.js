const Pool = require('pg').Pool

const pool = new Pool({
    user: process.env.db_user,
    host: process.env.db_host,
    database: process.env.db_db,
    password: process.env.db_pass,
    port: process.env.db_port
})



module.exports = (bot) =>{
    bot.on('postback:RECEIVE_PLASMA', (payload, chat) => {
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
                    askAge(convo)
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
            }else{
              convo.set('age',text);
              askAffectedDate(convo);
            }

        });
    };


    const askAffectedDate = (convo) =>{
        convo.ask( (convo) =>{
            convo.say('How long ago were you diagnosed with covid-19? Input just the number of days',{typing:true});
        }, (payload,chat,data) =>{
            const text = payload.message.text;
            if( isNaN(text) ){
                convo.say('That\'s not a proper number of days').then(()=> askAffectedDate(convo));
            }else{
                convo.set('affectedDate',text);
                askBloodGroup(convo);

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
            convo.say('Please provide us with your phone number or email address so that plasma donors can contact you easily',{typing:true});
        }, (payload,chat,data) =>{
            const text = payload.message.text;
            // Check the blood group crieteria
            convo.set('contact',text);
            showDetails(convo);
        });
    };

    const showDetails = (convo) =>{
        const query = {
            text: 'INSERT INTO fbcontest(m_id,type,data,bg) VALUES($1,$2,$3,$4)',
            values: [
              convo.get('profile').id,
              1,
              {
                name:convo.get('profile').first_name+' '+convo.get('profile').last_name,
                image:convo.get('profile').profile_pic,
                timestamp:Date.now(),
                age:convo.get('age'),
                location:convo.get('location'),
                contact:convo.get('contact'),
                sex:convo.get('gender'),
                affected:convo.get('affectedDate')
              },
              convo.get('BG')
            ]
          }
          pool.query(query).then(res=>{
            const details = `So, Here is what we got from you,\n`+
                `I ${convo.get('profile').first_name+' '+convo.get('profile').last_name} , ${convo.get('age')} years ${convo.get('gender')} `+
                `with blood group ${convo.get('BG')}  `+
                `I have diagnosed with covid-19 for ${convo.get('recoveredDate')} days `+
                `I need plasma as soon as possible.
            `;
            convo.say(details,{typing:true}).then(()=>{
              convo.say("We have taken your information and will let you know as soon as we find a match for you",{typing:true}).then(()=>{
                pool.query(`select * from fbcontest where type=0 and bg=\'${convo.get('BG')}\'`).then(res=>{
                    if(res.rows.length>0){
                      var tmpMsg='We have found some donors matching your bloodgroup';
                      res.rows.map((row,ind)=>{
                        var des=`\n\n(${ind+1}) ${row.data.name}\n`+
                                `Blood group - ${row.bg.toUpperCase()}\n`+
                                `Age - ${row.data.age} years, ${row.data.sex}\n`+
                                `Recovered from COVID-19 ${row.data.recovered} days ago\n`+
                                `Address - ${row.data.location}\n`+
                                `Contact - ${row.data.contact}\n`;

                        tmpMsg+=des
                      })
                      convo.say(tmpMsg,{typing:true}).then(()=>{
                        var elements=[]
                        res.rows.map(row=>{
                          var des=`Blood group - ${row.bg.toUpperCase()}\n`+
                                  `Age - ${row.data.age} years, ${row.data.sex}\n`+
                                  `Recovered from COVID-19 ${row.data.recovered} days ago\n`+
                                  `Address - ${row.data.location}\n`+
                                  `Contact - ${row.data.contact}\n`;
                          var element = {
                              "title":row.data.name,
                              "image_url":row.data.image,
                              "subtitle":des,
                              "buttons":[
                                {type: 'postback', title: `Inform-${row.sl}`, payload: 'INFORM_DONOR' }
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


    bot.on('postback:INFORM_DONOR', (payload, chat) => {
        var sl=payload.postback.title.split('-')[1]
        console.log(sl)
        pool.query('select * from fbcontest where sl='+sl).then(res=>{
          if(res.rows.length>0){
            var row=res.rows[0]
            var tmpMsg='We have found a plasma reciever matching your bloodgroup';
            var des=`\n\n${row.data.name}\n`+
                    `Blood group - ${row.bg.toUpperCase()}\n`+
                    `Age - ${row.data.age} years, ${row.data.sex}\n`+
                    `Affected from COVID-19 for ${row.data.affected} days\n`+
                    `Address - ${row.data.location}\n`+
                    `Contact - ${row.data.contact}\n`;
            tmpMsg+=des
            bot.sendTextMessage(row.m_id,tmpMsg).then(()=>{
              var des=`Blood group - ${row.bg.toUpperCase()}\n`+
                      `Age - ${row.data.age} years, ${row.data.sex}\n`+
                      `Affected from COVID-19 for ${row.data.affected} days\n`+
                      `Address - ${row.data.location}\n`+
                      `Contact - ${row.data.contact}\n`;
              var element = {
                  "title":row.data.name,
                  "image_url":row.data.image,
                  "subtitle":des
              };
              bot.sendGenericTemplate(row.m_id,[element],{typing:true}).then(()=>{
                convo.end()
              })
            })

          }
        })

    });


};
