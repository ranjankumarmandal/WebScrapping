let cheerio = require("cheerio");
let request = require("request");
let fs = require("fs");

function getAllMatchesLink(link) {
    request(link, cb);
}


function cb(error, response, html) {
    if(error == null && response.statusCode == 200) {
        parseData(html);
    } else if(response.statusCode == 404) {
        console.log("Page not found");
    } else {
        console.log(error);
    }
}

function parseData(html) {
    let ch = cheerio.load(html);
    let bothInnings = ch(".card.content-block.match-scorecard-table .Collapsible");
    //console.log(bothInnings.length);
    for(let i = 0; i < bothInnings.length; i++) {
        let teamName = ch(bothInnings[i]).find("h5").text();
        teamName = teamName.split("INNINGS")[0].trim();
        //console.log(teamName);

        let allTrs = ch(".table.batsman tbody tr");     //[<tr> </tr>, <tr> </tr>, <tr> </tr>, <tr> </tr> ] => 44 Trs
        for(let j = 0; j < allTrs.length; j++) {
            let allTds = ch(allTrs[j]).find("td");
            if(allTds.length > 1) {
                let batsmanName = ch(allTds[0]).find("a").text().trim();
                let runs = ch(allTds[2]).text().trim();
                let balls = ch(allTds[3]).text().trim();
                let fours = ch(allTds[5]).text().trim();
                let sixes = ch(allTds[6]).text().trim();
                let strikeRate = ch(allTds[7]).text().trim();
                //console.log(`Batsman = ${batsmanName} Run = ${runs} Ball = ${balls} Four = ${fours} Six = ${sixes} SR = ${strikeRate}`);
                processData(teamName, batsmanName, runs, balls, fours, sixes, strikeRate);
            }
        }
    }
    
    console.log("#####################################################################################");
}

function processData(teamName, batsmanName, runs, balls, fours, sixes, strikeRate) {
    let isTeamFolder = checkTeamFolder(teamName);
    if(isTeamFolder) {
        let isBatsman = checkBatmanFile(teamName, batsmanName);
        if(isBatsman) {
            updateBatsmanFile(teamName, batsmanName, runs, balls, fours, sixes, strikeRate);
        } else {
            creteBatsmanFile(teamName, batsmanName, runs, balls, fours, sixes, strikeRate);
        }
    } else {
        createTeamFolder(teamName);
        creteBatsmanFile(teamName, batsmanName, runs, balls, fours, sixes, strikeRate);
    }
}

function checkTeamFolder(teamName) {
    return fs.existsSync(teamName);
}

function createTeamFolder(teamName) {
    fs.mkdirSync(teamName);
}

function checkBatmanFile(teamName, batsmanName) {
    //teamName = india
    //batsmanName = MSDhoni
    // filepath = india/MSDhoni
    let filePath = `${teamName}/${batsmanName}.json`;
    return fs.existsSync(filePath);
}

function creteBatsmanFile(teamName, batsmanName, balls, runs, fours, sixes, strikeRate) {
    let filePath = `${teamName}/${batsmanName}.json`;

    let batsmanFile = [];
    let innings = {
        Run : runs,
        Ball : balls,
        Four : fours,
        Six : sixes,
        SR : strikeRate
    };

    batsmanFile.push(innings);
    batsmanFile = JSON.stringify(batsmanFile);  //Before sending to server, always convert JSON file to string

    fs.writeFileSync(filePath, batsmanFile);
}

function updateBatsmanFile(teamName, batsmanName, balls, runs, fours, sixes, strikeRate) {
    let filePath = `${teamName}/${batsmanName}.json`;

    let batsmanFile = fs.readFileSync(filePath);
    batsmanFile = JSON.parse(batsmanFile);   //stringify => original form   [note - for implemention of code always parse your string JSON to object level]
    innings = {
        Run : runs,
        Ball : balls,
        Four : fours,
        Six : sixes,
        SR : strikeRate
    };

    batsmanFile.push(innings);
    batsmanFile = JSON.stringify(batsmanFile);   //Before sending to server, always convert JSON file to string

    fs.writeFileSync(filePath, batsmanFile);
}




module.exports = getAllMatchesLink;