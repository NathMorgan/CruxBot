//Requiring dependencies
var Config = require('config');
var Crawler = require("simplecrawler");
var Cheerio = require('cheerio')
var fs = require('fs');

//Getting the config
var mConfig = Config.get('Main');

var cruxCrawler = new Crawler(mConfig.StartHere);
var websites = [mConfig.StartHere];

cruxCrawler.interval = mConfig.Timeout;
cruxCrawler.maxConcurrency = mConfig.MaxConcurrency;
cruxCrawler.acceptCookies = mConfig.AcceptCookies;
//cruxCrawler.discoverResources = true;

var conditionID = cruxCrawler.addFetchCondition(function(parsedURL) {
    return !parsedURL.path.match(/(\.pdf$)|(\.css$)|(\.png$)|(\.gif$)|(\.jpeg$)|(\.js$)/i);
});

cruxCrawler.on("fetchcomplete", function(queueItem, response) {
    console.log("Crawling: " + queueItem.url);

    var html = response.toString();
    var $ = Cheerio.load(html);

    $("a").each(function(i, element){
        var link = $(this).attr('href');
        if(link){
            var matches = link.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
            var domain = matches && matches[1];
            if(domain){
                if(websites.indexOf(domain) == "-1"){
                    websites.push(domain);
                }
            }
        }
    });

    websites.forEach(function(website){
        cruxCrawler.queue.add("http", website, 80, "/");
    });
});

cruxCrawler.start();
