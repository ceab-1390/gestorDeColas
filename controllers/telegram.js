require('dotenv').config();
const {Telegraf, Markup, session, Scenes, WizardScene} = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);


//bot.telegram.sendMessage('@GestorColasMovilnet','Hola cesar')

bot.launch();
module.exports = {bot};