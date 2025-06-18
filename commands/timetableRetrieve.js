const ical = require("node-ical");
const fs = require("fs");
const config = JSON.parse(fs.readFileSync("./config.json"));

async function timetableRetrieve(start, end) {
    let parsedInfo = {};
    const people = Object.keys(config.people).slice(0, 10);

    const calendarPromises = people.map(async (person) => {
        try {
            const data = await ical.async.fromURL(config.people[person]);
            const filtered = Object.values(data).filter(event =>
                event.type === "VEVENT" &&
                event.start &&
                event.start >= start &&
                event.start <= end
            );
            parsedInfo[person] = JSON.parse(JSON.stringify(filtered));

            // DURHAMIFICATION OF DATA
            if(config.people[person].includes("durham.ac.uk")){
                for(var i = 0; i < parsedInfo[person].length; i++){
                    let currentSummary = parsedInfo[person][i].summary
                    const moduleCodeMatch = currentSummary.match(/^[A-Z]+\d+/);
                    const typeMatch = currentSummary.match(/-\s*(\w+)/);
                    const moduleCode = moduleCodeMatch ? moduleCodeMatch[0] : '';
                    const type = typeMatch ? typeMatch[1].substring(0, 4) : '';
                    parsedInfo[person][i].summary = `${moduleCode}/${type}`;
                }
            }
        } catch (err) {
            console.error(`Error fetching timetable for ${person}:`, err);
            parsedInfo[person] = [];
        }
    });

    await Promise.all(calendarPromises);

    return parsedInfo;
}

module.exports = { timetableRetrieve };