# How to build
1. `npm install`
2. `cd react-survey-editor && npm install && cd ..`
3. `(node_modules/.bin/)gulp build`
4. optionally `gulp cache-bust`

# Project build commands

## Dashboard
* Watching all of dashboard `gulp watch.dash`
* Watching only angular part of dashboard `gulp watch.dash.angular` (recommended when not touching survey-editor)
* Developing survey-editor hot reloading standalone version `cd react-survey-editor && npm start` (will run at localhost:5050 outside docker)

## Other commands
* `gulp watch.print`
* `gulp watch.signUp`
* `gulp watch.signUpNew`

