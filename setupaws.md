# AWS Setup

You must have an AWS account.

## Lambda

Go to AWS Lambda --> select a region (e.g. `eu-west-2`) --> Create function --> Call it what you want, but it MUST be in NodeJS --> upload a zip of this repository once you get on -->  deploy!

Note, the ZIP must have index.js in the root.

You must get your ARN - this should be displayed to you.

You should also change the Configuration in the `Configuration` step. I set mine up as:
- Memory: 512 MB
- Timeout: 0 min 10 sec
You may need to adjust these values.
This system may be slow, as it requires an ical to be fetched.

## API Gateway

Go to API Gateway --> Create API --> On the `REST API` click `Import` (note - do NOT use REST API Private) --> Paste the following:
```yaml
openapi: "3.0.1"
info:
  title: "jointTimetable"
  description: "Joint Timetable (https://github.com/premraghvani/joint-timetable)"
  version: "2025-06-18T12:00:00Z"
servers:
- url: "https://github.com/premraghvani/joint-timetable"
paths:
  /:
    x-amazon-apigateway-any-method:
      parameters:
      - name: "Cookie"
        in: "header"
        schema:
          type: "string"
      - name: "proxy"
        in: "path"
        required: true
        schema:
          type: "string"
      responses:
        "200":
          description: "200 response"
          headers:
            Set-Cookie:
              schema:
                type: "string"
            Content-Type:
              schema:
                type: "string"
          content: {}
      x-amazon-apigateway-integration:
        type: "aws"
        httpMethod: "POST"
        uri: "{{{CHANGE THIS}}}"
        responses:
          default:
            statusCode: "200"
            responseParameters:
              method.response.header.Set-Cookie: "integration.response.body.setCookie"
              method.response.header.Content-Type: "integration.response.body.contentType"
            responseTemplates:
              text/html: "$input.path(\"body\")"
        requestParameters:
          integration.request.header.Cookie: "method.request.header.Cookie"
          integration.request.path.proxy: "method.request.path.proxy"
        requestTemplates:
          application/json: "{}"
        passthroughBehavior: "when_no_match"
        contentHandling: "CONVERT_TO_TEXT"
components: {}
```
Noting `{{{CHANGE THIS}}}` reads as: `arn:aws:apigateway:{region}:lambda:path/2015-03-31/functions/arn:aws:lambda:{region}:{accountId}:function:{functionName}/invocations`, where `arn:aws:lambda:{region}:{accountId}:function:{functionName}` is the `arn` given, and `{region}` is the region of the function.

Then, when it is loaded, you must press `Deploy` and in that process, create a stage. You can call the stage whatever, e.g. `prod`.

NOTE: You may need to re-link the Lambda function because of permissions. A simple way to do this is by opening up the `/ - ANY` thing,
heading to the `Integration request` panel, and pressing `Edit`. Then, simply scroll down and press `Save`. This somehow works.

## Custom Domain Name

In API Gateway, on the side panel, press `Custom Domain Name`. The process from there is intuitive. Remembering to set up certificates.

From there, go back to custom domain names, select the domain, scroll down to `Route details`, press `Configure API Mappings`, and
then add it so API: whatever API you created in the last step, and set the `Stage` to, to what you named it in the last step. Then, press save.

Remember, when setting certificates, you may have added CNAME records. You must add them for the domain too. You will see under the
`API Gateway domain name` in the panel you are shown once you open the domain name, something that looks like `d-**********.execute-api.eu-west-2.amazonaws.com`
(where `***`'s are blacked out numbers and lowercase letters). You must copy this, and paste this into your DNS records, as a CNAME map from what
you specified the domain as.

Et Voilla.