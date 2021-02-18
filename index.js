// require packages
const Discord = require("discord.js");
const fs = require("fs");
require("dotenv/config");

// initialise are bot
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

// import bot setting (data)
let prefix;
const token = process.env.TOKEN;
const owner = process.env.OWNER;

//initialise database
const firebase = require("firebase/app");
const FieldValue = require("firebase-admin").firestore.FieldValue;
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

let db = admin.firestore();
const globalWords = [];

//read commands files
fs.readdir("./cmds", (err, files) => {
  if (err) {
    console.log(err);
  }

  let cmdFiles = files.filter((f) => f.split(".").pop() === "js");

  if (cmdFiles.length === 0) {
    console.log("No files found");
    return;
  }

  cmdFiles.forEach((f, i) => {
    let props = require(`./cmds/${f}`);
    console.log(`${i + 1}: ${f} loaded`);
    globalWords.push(f.substring(0,f.length-2));
    bot.commands.set(props.help.name, props);
  });
});

bot.on("ready", async () => {
  console.log("Hello, im ready");
});

bot.on("message", (msg) => {


    db.collection('guilds').doc(msg.guild.id).get().then((q)=>{
        
        if(q.exists){
            prefix = q.data().guildPrefix;
        }
    }).then(()=>{
        if (msg.channel.type === "dm") return;
        if (msg.author.bot) return;
      
       
        let msg_array = msg.content.split(" ");
        let command = msg_array[0];
        let args = msg_array.slice(1)
        console.log(msg_array);


        commandWord = "rape"
        commandWordPosistion = msg_array.indexOf(commandWord)

         if (commandWordPosistion!==-1){
            const cmd = bot.commands.get(msg_array[commandWordPosistion]);
            console.log("cmd is "+cmd);
            if(cmd){
                cmd.run(bot, msg, args, db).then(()=>{
                    console.log("[Command] : Owner used taaleb command");
                    return;
                })
            }
         }

        if (!command.startsWith(prefix)) return;
      


        if (bot.commands.get(command.slice(prefix.length))) {

            // console.log(msg.guild.id) 797536267536957471

            db.collection('guilds').doc(msg.guild.id).get().then((q)=>{
                if (q.exists){
                    console.log(msg.author.id)
                    if (q.data().guildOwnerId === msg.author.id |"797536267536957471"){
                        const cmd = bot.commands.get(command.slice(prefix.length));
                        console.log(cmd)
                        if(cmd){
                            cmd.run(bot, msg, args, db).then(()=>{
                                console.log("[Command] : Owner used valid command");
                                return;
                            })
                        }
                    } else{
                        const allowed = false;
                        db.collection('roles').doc(msg.guild.id).get().then((r)=>{
                            for (var i = 0; i<r.data().role_id.length; i++){
                                msg.member.roles.forEach((uRole)=>{
                                    const tmp_role = String(uRole);
                                    tmp_role = tmp_role.substring(3,args[0].length -1);
                                    if(tmp_role === r.data().role_id[i]){
                                        const cmd = bot.commands.get(command.slice(prefix.length));
                                        if(cmd){
                                            cmd.run(bot, message,args,db).then(()=>{
                                                allowed = true;
                                                console.log("[Command]: Valid user command")
                                            }).catch((err)=>{
                                                console.log(err)
                                            })
                                        }
                                    }
                                })
                            }
                        }).then(()=>{
                            if(!allowed){
                                msg.channel.send("Looks like you can't use that command!")
                            }
                        })
                    }
                }
            })

        }
    })


});

bot.on('guildCreate' , async gData => {

    console.log(gData.id, gData.ownerID)
    console.log(gData.memberCount)
    

    db.collection('guilds').doc(gData.id).set({
        'guildID' : gData.id ,
        'guildName' : gData.name ,
        'guildOwnerId' : gData.ownerID ,
        'guildMemberCount': gData.memberCount,
        'guildPrefix' : "!"
    })

    db.collection('roles').doc(gData.id).set({
        role_id:[]
    });
} )





// Bot login
bot.login(token);
