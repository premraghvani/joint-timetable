const { weekDetails } = require("./commands/weekDetails");
const { termDetails } = require("./commands/termDetails");

// handler
module.exports.handler = async (event) => {
    if(!!event.querystring){
        const keyValuePairs = event.querystring.substring(1, event.querystring.length - 1).split(', ');
        const jsonObject = {};
        keyValuePairs.forEach(pair => {
            const [key, value] = pair.split('=');
            jsonObject[key] = value;
        });
        event.querystring = jsonObject
    } else {
        event.querystring = {};
    }

    if(!!event.querystring.term){
        const term = event.querystring.term;
        const data = await termDetails(term);
        return{body:data, contentType:"text/html"}
    } else {
        const inputDate = convertYMDToDMY(event.querystring.date) || formatDateToDDMMYYYY(new Date());
        const data = await weekDetails(inputDate);
        return{body:data, contentType:"text/html"}
    }

};

// extra
function formatDateToDDMMYYYY(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}
function convertYMDToDMY(ymdString) {
    if(!ymdString){return;}
    const [year, month, day] = ymdString.split("-");
    return `${day}-${month}-${year}`;
}