const PORT = 3030;

//preamble
const express = require("express");
const { weekDetails } = require("./commands/weekDetails");
const { termDetails } = require("./commands/termDetails");

// configures the app
const app = express();
app.use(express.raw({ type: "*/*", limit: "10mb" }));

app.get("/", async function(req, res){
    const inputDate = convertYMDToDMY(req.query.date) || formatDateToDDMMYYYY(new Date());
    const data = await weekDetails(inputDate);
    res.set("Content-Type", "text/html").send(data);
})

app.get("/term",async function(req,res){
    const term = req.query.term;
    const data = await termDetails(term);
    res.set("Content-Type", "text/html").send(data);
})

// runs
app.listen(PORT);
console.log(`Running http://localhost:${PORT}`)

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