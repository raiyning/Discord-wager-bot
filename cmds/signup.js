module.exports.run = async (bot, message, args) => {
    
    const user = message.author;

    let userRef = bot.db.collection(message.guild.id).doc(user.id);

    let profile = await userRef.get();

    if (profile.exists) return message.channel.send('You already have a bank account.');

    userRef.set({
        'checkings': 0.0,
        'savings': 10.0
    }).then(() => {
        message.channel.send(`${message.author}\ncheckings: 0.0\nsavings: 0.0`);
    }).catch((err) => {
        console.log(err);
    })
}

module.exports.help = {
    name: "signup",
    type: "open"
}