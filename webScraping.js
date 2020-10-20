var axios = require('axios');
var cheerio = require('cheerio');

//TELEGRAM BOT
const TelegramBot = require('node-telegram-bot-api');
const token = '1168418114:AAFdLeDCO0ui5WWlf7AWi-kt3Xg4SLGru0o';
const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/start/, (msg) => {

    bot.sendMessage(msg.chat.id, "Bienvenid@ amig@ de PSN !!! Puedes comenzar escribiendo: 'Hi'");
        
});

bot.onText(/\/OfertasHalloween/, async (msg) => {
    const offers = await obtainMainOffers();
    console.log({offers})
    const obtainGames = await obtainPage(offers[0].href)
    

    obtainGames.forEach( game => {  
        const text = parseGameToText(game)
        bot.sendMessage(msg.chat.id, text);
        
    })
    
    
});


bot.onText(/\/JuegosAMenosDe20/, async (msg) => {
    const offers = await obtainMainOffers();
    console.log({offers})
    const obtainGames = await obtainPage(offers[1].href)

    obtainGames.forEach( game => {  
        const text = parseGameToText(game)
        bot.sendMessage(msg.chat.id, text);
        
    })
    
    
});
bot.onText(/\/OfertasSemana/, async (msg) => {
    const offers = await obtainMainOffers();
    console.log({offers})
    const obtainGames = await obtainPage(offers[2].href)

    obtainGames.forEach( game => {  
        const text = parseGameToText(game)
        bot.sendMessage(msg.chat.id, text);
        
    })
    
    
});

bot.onText(/\/Descuentos/, async (msg) => {
    const offers = await obtainMainOffers();
    console.log({offers})
    const obtainGames = await obtainPage(offers[3].href)

    obtainGames.forEach( game => {  
        const text = parseGameToText(game)
        bot.sendMessage(msg.chat.id, text);
        
    })
    
    
});
function parseGameToText(game) {
    return `${game.title} \nPRECIO ANTERIOR: ${game.oldPrice} \nNUEVO PRECIO: ${game.price} \nDESCUENTO ${game.discountHR}`;
}

bot.on('message', (msg) => {
    if (msg.text.toString().toLowerCase().indexOf('hi') === 0) {
        bot.sendMessage(msg.chat.id,"OFERTAS EN PSN ACTUALMENTE: ");
        obtainMainOffers()
            .then(offers => {
                //const text = formatOffersToText(offers)
                //bot.sendMessage(msg.chat.id, JSON.stringify(offers));
                bot.sendMessage(msg.chat.id,"/OfertasHalloween /JuegosAMenosDe20 /OfertasSemana /Descuentos Para visualizar las ofertas debes pulsar sobre ellas ");
            })
    } 
            
    });

    

//GET LINKS TO ALL DISCOUNT PAGES
var mainURL = ('https://store.playstation.com/es-es/grid/STORE-MSF75508-GAMESPECIALOFF/1')

function obtainMainOffers(){        
    return axios.get(mainURL)
        .then(response => {    
            return new Promise(resolve => {

                setTimeout(() => {
                    resolve(response)
                    
                }, 1000);
            })
        })
        .then( response => {
            const $ = cheerio.load(response.data);
            const links = $('.grid-cell-row__container .ember-view');
            const offersURLs=[];
            const offersURLsRaw=[];
            for(var i=0; i < links.length; i++){
                var url= $($(links[i]).find('a')[0]).attr('href');
                if(typeof(url)==='undefined'){
                    continue;
                }else{
                    if(offersURLs.includes('https://store.playstation.com'+url)){
                        continue;
                    }
                }
                offersURLs.push('https://store.playstation.com'+url);            
                offersURLsRaw.push(url);            
            }
            const infoOffers = [];
            offersURLsRaw.forEach( (url, idx) => {
                const element = $(`.grid-cell-row__container .ember-view a[href="${url}"]` );
                const img = $($(element).find('.product-image__img--main .product-image__img')[0]).attr('src')
                const sibling = $(element.next());
                const infoOffer = {};
                infoOffer.href = offersURLs[idx];
                infoOffer.img = img;
                infoOffer.name = sibling.text().trim()
                infoOffers.push(infoOffer)
            })
            return infoOffers;        
        })
}

function obtainPage(url){
    return axios.get(url).then(response => {
        const $ = cheerio.load(response.data);
        const productsElements = $('.__desktop-presentation__grid-cell__base__0ba9f');
        const products = [];
        for(var i = 0; i < productsElements.length; i++){            
            const product = {};
            product.title = $($(productsElements[i]).find('.grid-cell__title')[0]).text().replace(/\n/g, "").replace(/\t/g, "");
            product.oldPrice = $($(productsElements[i]).find('.price-display__strikethrough')[0]).text().replace(/\n/g, "");
            product.price = $($(productsElements[i]).find('.price-display__price')[0]).text().replace(/\t/g, "");
            product.image = $($(productsElements[i]).find('.product-image__img--main .product-image__img')[0]).attr('src');      
            product.discountHR = $($(productsElements[i]).find('.discount-badge__message')[0]).text().replace("AHORRA UN ", "");  
            products.push(product);        
            
        }
        return products;
               
    })
}
  

