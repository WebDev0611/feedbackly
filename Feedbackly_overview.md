# Feedbackly overview

Feedbackly is a system that is used to collect feedbacks from customers and turn them into instant sales.

Test a survey out here: http://fbly.io/l/1dxvtq

Leave your correct e-mail address so you understand how the upsell feature works after answering the survey.

The survey is available in many different devices: web, iPad, mobile, web plugin, e-mail etc.

### Components of the service

The software runs as a collection of Docker services. Each service is in its own git repository. The services are networked together so all services can be accessed from inside the cluster via HTTP endpoints by their respective DNS names. (http://dash, http://client, http://barcode and so on) Public-facing services are exposed via subdomains port 3000 and NGINX reverse proxy.


#### Dashboard
Dashboard is used to create surveys and view the results of the feedback. It is also used to create feedback channels, create upsell offers and notifications for feedback etc. The dashboard is mostly written in Node.js + Angular however there is currently 1 part written in React Redux that is built separately (the survey editor).

	URL: http://dash.localhost:3000
	BUILD TASKS: See Readme.md inside the dash repository

The survey editor can be edited separately /w hot reload by running npm start in the react-survey-editor folder.

We are using https://materializecss.com for our styling in dash
in addition to https://krescruz.github.io/angular-materialize/
So get UI elements from these

Videos:

- Dashboard section overview (in progress)
- Creating channels (in progress)
- Creating a survey https://youtu.be/Gosut6DYHYE
- Viewing results https://youtu.be/I4sGJrVBDx4
- Upsell (with client + handler) (in progress)
- Notifications (with client + handler) https://youtu.be/rNeSfhyfOsc

Looking at the code: https://youtu.be/A-IOTv5RVpA

#### Client
The client is used to collect the data and to show the surveys. It is written in node + react redux. The main application is served in many forms: the iPad app available in the App store wraps this app in a web view and the embeddable web plugin shows this survey in an iframe.

	URL: http://client.localhost:3000
	BUILD TASKS: See Readme.md inside the client repository

#### API
This service is a new addition to the cluttered API's of Dash and Client. Currently it is quite bare but you can have an idea what it will look like by checking out the routes. Some functionality is already live.

	URL: http://api.localhost:3000
	no build tasks needed

#### Upsell handler
This service handels the Upsell-type feedbacks and sends an email if there is a upsell offer found. Written in node + express.

	there is no public url.
	The service API is available at http://upsell-handler

#### Notification handler
Similarly to upsell handler, this takes a feedback from the client and examines if it matches any rules to send email notifications to the one maintaining the survey.

	there is no public url.
	The service API is available at http://notification-handler

#### PDF Service
This PhantomJS-based service makes a pdf file out of a web page. It is used internally to create reports.

	there is no public url
	The service API is available at http://pdfservice

#### BARCODE Service
This service creates barcodes based on a HTTP endpoint. It is a dockerized fork from BwipJS.

	URL: http://barcode.localhost:3000


#### Auxiliary services
There is a nginx instance running in front of the cluster and all incoming traffic is running through this reverse proxy.

The software bundles MongoDB and Redis which are running on the Docker. For convenience, their ports are exposed so outside services can also connect to them on your localhost.
