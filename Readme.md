Ensure that you have node v7.7+ installed. ("$ which node" should return a directory)
Ensure that you have Docker installed.
Ensure "docker-compose version" >= 1.12.0

Go to Docker settings and add /data to your file sharing preferences.
Ensure that you can pull private repos from Bitbucket

Pull this repo and cd into it. Then excecute the following commands to get the stack running in localhost.

~~~~
bash .bin/init.sh
~~~~

Build the stack images for docker:
~~~~
(sudo) docker-compose build
~~~~

To run the stack:
~~~~
(sudo) docker-compose up
~~~~

When the stack is running generate a system admin user in the folder init_database.

~~~~
$ cd init_database
$ npm i
$ node index
~~~~


IF YOU HAVE PROBLEMS WITH AUTO-RELOAD
1. Make sure to run docker-compose build every time you add a new package with npm
2. Make sure you have shared the folder the Feedbackly project is in with Docker, so they will mount into docker file system.
3. Make sure you are running the correct build tasks in gulp if you're doing frontend code
