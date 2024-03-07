# Instructions for Running Project

User credentials for logging in (Main user account):

user: Rita5     
password: hashed_password1  

Due to the decision to use Express and Node on the backend for the app, a simple upload to Expo Snack was not possible. It only supports the front end. I have uploaded it anyway so you are able to see the front end files. To see the funcionality of the backend incorporated and to actually be able to manoeuvre around the application, please see the youtube video provided as well as the source code for the project to run locally if necessary. 

The Expo Snack link is here:
https://snack.expo.dev/@mariamjo/bujjit2

Again, please note this will not display all the functionality as Expo Snack does not support incorporation with the backend. It does, however, contian all the front end component code and will display the app loading.

In case it is helpful, please see the Expo update link here:
https://expo.dev/accounts/mariamjo/projects/bujjit/updates/b7bd44eb-478e-4b4a-815b-1416bd533cfa


[expo-cli] Export was successful. Your exported files can be found in dist
✔ Exported bundle(s)
√ Uploaded 2 app bundles
√ Uploading assets skipped - no new assets found
√ Channel: branch-1w pointed at branch: branch-1w
✔ Published!

Branch             branch-1w
Runtime version    exposdk:48.0.18
Platform           android, ios
Update group ID    afa3c1ce-3ca1-41f6-aa92-1d8504518112
Android update ID  56683854-51b0-4a7c-86dd-5b9b52083f8c
iOS update ID      166750f3-e19e-49a6-ad22-5b13cd9a4c4c
Message            Final
Website link       https://expo.dev/accounts/mariamjo/projects/bujjit/updates/afa3c1ce-3ca1-41f6-aa92-1d8504518112

Or an alternative link here:
exp://u.expo.dev/b709070e-b57c-4ded-80cf-c1d47ad3997c?channel-name=branch-1w&runtime-version=exposdk%3A48.0.18


Expo credentials if necessary: 
username: mariamJo	
password: uolStudent123


Youtube link to video (Public and tested out in Incognito mode): 
https://www.youtube.com/watch?v=6PzwIQuhe-4

Github as an alternative means of obtaining files (public repository):
https://github.com/cozie11/bujjit.git


Backend funcitonality is managed via Express server and Node.js, both this and the database (sqlite3 database) are found in the server directory.

Database can be accessed using the following command from /db directory:
sqlite3 bujjit.db

Express server can be started from server directory using the following command: 
node app.js
