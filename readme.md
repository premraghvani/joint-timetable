# Preamble

So, at university me and a few friends wanted to have a joint calendar - so why not have it dynamic.

Durham University allows an ical export, and some other unis may. This is a pre-requisite for this.

This project can work locally, or in AWS Lambda.

# Download and Run

1. `npm install` to install stuff

2. Configure - check below

3. `node local.js` to run locally, or just put it in AWS Lambda (connected with API Gateway), pointing to `index.js`. By default, it will run on port  `3030`.
To change this, please go to line one of `local.js` and change the port - it is common sense where

# Config

The `config.json` file looks like:
```json
{
    "people":{
        "personOne":"[LinkToICS]"
    },
    "terms":{
        "michaelmas":{
            "start":"07-10-2024",
            "end":"13-12-2024"
        }
    }
}
```
## People

As an example, `personOne` is the key (so the person name displayed), and `[LinkToICS]` is their corresponding string, which is an `.ics` calendar (`.ical`) is accepted. Must be a web calendar.
Add rows underneath this `personOne` for other people. **A maximum of 10 people are permitted. A minimum of 1 person is required** 

## Terms

As an example, `michaelmas` is the key (so the term name displayed), and we have an object corresponding to it, with a `start` date and an `end` date, both
must be in `DD-MM-YYYY`. Note that only Mondays to Fridays are displayed.
Add rows underneath this `michaelmas` for other terms. **A maximum of 5 terms are permitted. A minimum of 1 term is required**

