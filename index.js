

const { response } = require("express");
const rp = require("request-promise");
const { Telegraf } = require("telegraf");
require("dotenv").config();

async function coinmarket(symbol) {
  try {
    const requestOptions = await {
      method: "GET",
      uri: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/info",
      qs: {
        symbol: symbol,
      },
      headers: {
        "X-CMC_PRO_API_KEY": "ce9f7548-5826-4058-8080-70b6ca9e5b18",
      },
      json: true,
      gzip: true,
    };

    let data = await rp(requestOptions)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        console.log('API call error:', err.message);
        return "error";
      });

    return data;
  } catch (e) {
    console.log(e);
  }
}

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) =>
  ctx.reply(
    "Привет, я создан для быстрого уточнения контракта того или иного токена. Напиши /help для уточнения функционала ;)"
  )
);

bot.help((ctx) =>
  ctx.reply(
    "Format: " +
      "\n" +
      "/contract SYMBOL " +
      "\n" +
      "or" +
      "\n" +
      "/contract SYMBOL NETWORK_NAME" +
      "\n" +
      " " +
      "\n" +
      "Example: /contract HOTCROSS Binance " +
      "\n" +
      " " +
      "\n" +
      "Network names and symbols:" +
      "\n" +
      "Ethereum - Ethereum or ERC20" +
      "\n" +
      "Binance Smart Chain - Binance or BEP20" +
      "\n" +
      "Polygon - Polygon and etc"
  )
);

bot.command("contract", async (ctx) => {
  try {
    if (ctx.message.text.split(" ")[1] == null) {
      ctx.reply("Ошибка: необходимо указать символ токена!");
    } else if (
      (ctx.message.text.split(" ")[1] != null) &
      (ctx.message.text.split(" ")[2] == null)
    ) {
      let symbol = ctx.message.text.split(" ")[1].toUpperCase();
      let resp = await coinmarket(symbol);
      if (resp == "error") {
        ctx.reply(
          "Что-то пошло не так :(" +
            "\n" +
            "Проверь правильность ввода и повтори попытку"
        );
      } else {
        let str = "";
        resp.data[symbol].contract_address.forEach((element) => {
          str += element.platform.name + ": " + element.contract_address + "\n";
        });
        ctx.reply(resp.data[symbol].name + "\n" + str);
      }
    } else {
      let symbol = ctx.message.text.split(" ")[1].toUpperCase();
      let network_name = ctx.message.text.split(" ")[2].toLowerCase();
      network_name =
        network_name.charAt(0).toUpperCase() + network_name.slice(1);
      let resp = await coinmarket(symbol);
      if (resp == "error") {
        ctx.reply(
          "Что-то пошло не так :(" +
            "\n" +
            "Проверь правильность ввода и повтори попытку"
        );
      } else {
      if (network_name == "Ethereum" || network_name == "Erc20") {
        network_name = "Ethereum";
      } else if (network_name == "Binance" || network_name == "Bep20") {
        network_name = "Binance Smart Chain (BEP20)";
      }

      try {
        let str = "";
        resp.data[symbol].contract_address.forEach((element) => {
          if (element.platform.name == network_name) {
            str = element.contract_address;
          }
        });
        if (str == "") {
          ctx.reply(
            "Что-то пошло не так :(" +
              "\n" +
              "Проверь правильность ввода и повтори попытку"
          );
        } else {
          ctx.reply(str);
        }
      } catch (e) {
        console.log(e);
        ctx.reply(
          "Что-то пошло не так :(" +
            "\n" +
            "Проверь правильность ввода и повтори попытку"
        );
      }}
    }
  } catch (e) {
    console.log(e);
  }
});

let simply_answer = ['На каком это языке? ', 'Не понял :( ' , '🤷‍♂️', 
'🤕','🤔','😴','🤐','🤯']

function randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
  }
  
 bot.on('text', async (ctx) => {await ctx.reply(simply_answer[randomInteger(0, simply_answer.length-1)]) ;
    await ctx.reply('Чтобы понять как со мной общаться используй /help')
    })

bot.launch();
