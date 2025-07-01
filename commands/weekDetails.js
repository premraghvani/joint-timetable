const { timetableRetrieve } = require("../commands/timetableRetrieve");
const fs = require("fs");
const config = JSON.parse(fs.readFileSync("./config.json"));

async function weekDetails(dayInWeek) {
    let week = normaliseWeek(dayInWeek); // a small error exists in DST, but it would cut a Sunday at 11pm - there is unlikely anything on Sunday 11pm to Monday 12am so its good
    let timetable = await timetableRetrieve(week.start, week.end);

    let timetableHtml = fs
        .readFileSync("./assets/timetable.html")
        .toString()
        .replace(
            "REPLACE_WITH_JSON_DATA",
            `JSON.parse(\`${JSON.stringify(timetable)}\`)`
        )
        .replace("REPLACE_WITH_NOTICE", `${formatUTCDate(week.start)} to ${formatUTCDate(week.end)}`)
        .replace("REPLACE_WITH_TERMS", JSON.stringify(Object.keys(config.terms)));

    return timetableHtml;
}

function parseDate(ddmmyyyy) {
    const [day, month, year] = ddmmyyyy.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function normaliseWeek(dayInWeek) {
    const day = parseDate(dayInWeek);

    const dayOfWeek = day.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const distanceToSunday = 7 - ((dayOfWeek + 6) % 7) - 1;

    const monday = new Date(day);
    monday.setDate(day.getDate() - distanceToMonday);

    const sunday = new Date(day);
    sunday.setDate(day.getDate() + distanceToSunday);

    monday.setHours(0, 0, 0, 0);
    sunday.setHours(23, 59, 59, 999);

    return { start: monday, end: sunday };
}

function formatUTCDate(date) {
    const d = new Date(date);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}-${month}-${year}`;
}

module.exports = { weekDetails };
