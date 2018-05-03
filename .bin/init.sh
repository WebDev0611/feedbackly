#!/usr/bin/env bash

npm install -g node-gyp

(
    git clone -q git@bitbucket.org:tapinfeedback/api.git
    cd api
    npm i
) &

(
    git clone -q git@bitbucket.org:tapinfeedback/node-client.git client
    cd client
    npm i
    npm rebuild node-sass
) &

(
    git clone -q git@bitbucket.org:tapinfeedback/node-dashboard.git dash
    cd dash
    npm i
    npm rebuild node-sass
) &

(
    git clone -q git@bitbucket.org:tapinfeedback/healthchecks.git
    cd healthchecks
    npm i
) &

git clone -q git@bitbucket.org:tapinfeedback/nginx.git &

mkdir -p services
(
    cd services
    (
        git clone -q git@bitbucket.org:tapinfeedback/barcode.git
        cd barcode
        npm i
    ) &

    (
        git clone -q git@bitbucket.org:tapinfeedback/notification-handler.git
        cd notification-handler
        npm i
    ) &

    (
        git clone -q git@bitbucket.org:tapinfeedback/tinylinkproxy.git
        cd tinylinkproxy
        npm i
    ) &

    (   
        git clone -q git@bitbucket.org:tapinfeedback/pdfservice.git 
        cd pdfservice
        npm i
    ) &

    (
        git clone -q git@bitbucket.org:tapinfeedback/upsell-handler.git
        cd upsell-handler
        npm i
    ) &

    wait
) &

wait

cp -r .env client/.env
cp -r .env dash/.env

(
    cd client
    node_modules/.bin/gulp build --env dev
)

(
    cd dash
    (
        cd react-survey-editor
        npm install
        npm rebuild node-sass
    )
    node_modules/.bin/gulp build
)

mkdir -p ./services/job-runner
