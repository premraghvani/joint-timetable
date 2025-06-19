const timeZone = "Europe/London";

const { timetableRetrieve } = require("../commands/timetableRetrieve");
const fs = require("fs");
const config = JSON.parse(fs.readFileSync("./config.json"));

let termStart = ""
let periodWeeks = 0;

async function termDetails(term) {
    const validTerms = Object.keys(config.terms)
    if(!term || validTerms.includes(term) == false){
        term = validTerms[0];
    }

    termStart = parseDate(config.terms[term].start)
    periodWeeks = getWeeksInPeriod(parseDate(config.terms[term].start), parseDate(config.terms[term].end))
    let timetable = await timetableRetrieve(parseDate(config.terms[term].start), parseDate(config.terms[term].end));
    let simplifiedTimetable = {}

    let people = Object.keys(timetable)

    for(var i = 0; i < people.length; i++){
        simplifiedTimetable[people[i]] = simplifyTimetable(timetable[people[i]]);
    }

    let timetableHtml = fs
        .readFileSync("./assets/timetable.html")
        .toString()
        .replace(
            "REPLACE_WITH_JSON_DATA",
            `JSON.parse('${JSON.stringify(simplifiedTimetable)}')`
        )
        .replace("REPLACE_WITH_NOTICE", `Term ${term}`)
        .replace("REPLACE_WITH_TERMS", JSON.stringify(Object.keys(config.terms)));

    return timetableHtml;
}

function parseDate(ddmmyyyy) {
    const [day, month, year] = ddmmyyyy.split("-").map(Number);
    return new Date(year, month - 1, day);
}

// timetable simplification - partly courtesy of chatgpt
function simplifyTimetable(timetable) {
  let grouped = {};
  let summaries = [];

  // Group events by summary + time slot
  for (const event of timetable) {
    const key = `${event.summary} @ ${getTimeKey(event)}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(event);
  }

  // Process each group once
  for (const key in grouped) {
    const group = grouped[key].sort(
      (a, b) => new Date(a.start) - new Date(b.start)
    );
    const weeks = [
      ...new Set(group.map((ev) => getWeekNumber(ev.start))),
    ];

    const isWeekly = weeks.length == periodWeeks
    const recurrence = isWeekly ? "(weekly)" : `(${weeks.join(",")})`;

    const first = group[0];

    summaries.push({
      summary: `${first.summary} ${recurrence}`,
      description: first.description,
      location: first.location,
      start: first.start,
      end: first.end,
    });
  }

  return summaries;
}

// Helper functions (as before)
function getWeekNumber(dateStr) {
  const baseDate = new Date(termStart);
  const date = new Date(dateStr);

  // Reset hours, minutes, seconds to zero for accurate day diff
  baseDate.setHours(0,0,0,0);
  date.setHours(0,0,0,0);

  const diffDays = Math.floor((date - baseDate) / (24 * 60 * 60 * 1000));
  return Math.floor(diffDays / 7) + 1;
}


function getTimeKey(event) {
  const start = new Date(event.start);
  const end = new Date(event.end);

  const startFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timeZone,
    weekday: "short",
    hour: "numeric",
    hour12: false,
  });

  const endFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timeZone,
    hour: "numeric",
    hour12: false,
  });

  const startParts = startFormatter.formatToParts(start);
  const endParts = endFormatter.formatToParts(end);

  const weekday = startParts.find(p => p.type === "weekday").value;
  const startHour = startParts.find(p => p.type === "hour").value;
  const endHour = endParts.find(p => p.type === "hour").value;

  return `${weekday} ${startHour}-${endHour}`;
}

function getWeeksInPeriod(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);

  // Normalize time to midnight to avoid DST issues
  start.setHours(0,0,0,0);
  end.setHours(0,0,0,0);

  const diffDays = Math.floor((end - start) / (24*60*60*1000));
  return Math.floor(diffDays / 7) + 1; // inclusive of partial week
}


module.exports = { termDetails };
