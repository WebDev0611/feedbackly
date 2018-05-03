### Authentication

#### Getting API keys

Api keys are tied to users. Provided that your organization has API access enabled, an organization admin can get the API keys in the organization management panel. 


#### Using API keys


Authorizing requests to the API is done using an authorization header. 


Add the following header to your requests to authenticate them. Each key has the same access level as the user it is tied to.



```
"Authorization": "JWT {key}" 
```
