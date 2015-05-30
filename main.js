//Requiring dependencies
var Config = require('config');
var Crawler = require("simplecrawler");
var Cheerio = require('cheerio')
var fs = require('fs');
var url = require("url");

//Getting the config
var mConfig = Config.get('Main');

var cruxCrawler = new Crawler(mConfig.StartHere);
var websites = [mConfig.StartHere];

cruxCrawler.interval = mConfig.Timeout;
cruxCrawler.maxConcurrency = mConfig.MaxConcurrency;
cruxCrawler.acceptCookies = mConfig.AcceptCookies;

var conditionID = cruxCrawler.addFetchCondition(function(parsedURL) {
    return !parsedURL.path.match(/(\.pdf$)|(\.css$)|(\.png$)|(\.gif$)|(\.jpeg$)|(\.js$)/i);
});

cruxCrawler.on("fetchcomplete", function(queueItem, response) {
    console.log("Crawling: " + queueItem.url);

    var html = response.toString();
    var $ = Cheerio.load(html);

    $("a").each(function(i, element){
        var rawlink = $(this).attr('href');
        if(rawlink){
            link = url.parse(rawlink);
            if(websites.indexOf(link.href) == "-1" && mConfig.IgnoredDomains.indexOf(link.hostname) == "-1"){
                websites.push(link.href);
                cruxCrawler.queue.add(link.protocol, link.hostname, "80", link.pathname);
            }
        }
    });

    console.log("Queue count: " + cruxCrawler.queue.length);
});

cruxCrawler.start();
