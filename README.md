# frozen-server
Frozen Iguane Server

### Getting ready a development environment

#### MySQL
You will need Docker installed on your computer.
Step into the folder `mysql` and run `docker build . -t frozen-iguan/mysql` you will later run this container by issuing `docker run -dtp 3306:3307`. Note that you may the container port 3306 to the port 3306 on your local machine but, there exist hard coded values of this 3307 port in the code. You may of course change that and, better yet, create an env variable in the .env file for that matter.

#### MongoDB
Get ready a MongoDB installation on your computer (preferably as a Docker container).
- Change the .env file to point to your MongoDB installation

#### Angular Client
Clone this project at https://github.com/hervinhio/frozen-client
- Change constant ENDPOINT in  file `src/app/services/api.service.ts` to point to this server this server.

#### Handlebars Client
Clone this project at https://github.com/hervinhio/forzen-client-hbs
- Create an .env fale and change the variables there to point to the MongoDB server and to this server. Note that the BACKEND_URL variable is not yet used in the code, there exist duplications of a hardcoded url for the backend server, it's bad and probably you can change this to using the env variable.

#### Running the server
Simply issue the command npm run `npm run dev`. This command will start the server, initialize the **emss** database and run the importer to import database from the old non normalized database to the new one, **emss**. It will also write a configuration value into the MongoDB server to indicate that this import process has been achieved once and should no longer be attempted.

#### Running the clients
For the angular client, simply run the command `ng serve` and for the HBS client simply use the command `yarn dev`.


### Important notes
The HBS client was created using yarn as package manager.
