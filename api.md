# Insurance App 2.0

###API Dokumentation
---


## api/near

|URL-Parameter|Value|
|------|-----------|
|`location`| longtitude,latitude, ex. `52.5243700,13.4105300`|
|`radius`| Radius to search for POIs, ex. `1000`|
|`search`| Keyword to search for, ex. `Anwalt`|


## api/sendmail

|URL-Parameter|Value|
|------|-----------|
|`u`| username|
|`p`| password|
|`to`| Recipient Mail Adress|
|`from`| Senders Mail Adress|
|`subject`| Subject of the Mail|
|`text`| The Message to send|