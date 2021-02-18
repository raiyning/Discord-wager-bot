const Discord = require("discord.js");
const  FieldValue  = require("firebase-admin").firestore.FieldValue;

module.exports.run = async (bot, message, args, db) => {

    const reply = new Discord.RichEmbed()
    .setColor('#D6D62A')
    .setAuthor('Admin command', bot.user.avatarURL)
    .setTimestamp(new Date())
    .setFooter("raiyan's server")

    if (args.length === 0){
        reply.addField("{prefix}valid-role @rolename",'\u200b')
        message.channel.send({embed: reply})
    }else if (args.length === 1){
        if (args[0].length > 5){
            const role_id = args[0].substring(3,args[0].length -1);
            const added = false;

            message.guild.roles.forEach(element =>{
                const server = String(element);
                const tmp = server.substring(3,args[0].length -1);
                if (tmp === role_id ){
                    db.collection('roles').doc(message.guild.id).update({
                        'role_id':FieldValue.arrayUnion(role_id)
                    }).then(()=>{
                        reply.addField("👍 Valid entry", `${args[0]} has acess to the bot commands`);
                        message.channel.send({embed:reply})
                        added = true;
                    })
                }
            });
            
            setTimeout(() =>{
                if (!added){
                    reply.addField("❌  role not found", "The role has to exist on the server");
                    message.channel.send({embed:reply})
                }
            }, 2000)
        }
    }
}


module.exports.help = {
    name: "valid-role"
}