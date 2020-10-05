# Permit Tracker

The project is currently dockerized. To get started run in the terminal do these TWO things:

1. cd into the "client" folder and run "yarn install"
2. in the terminal run "docker-compose up". 


This will build the project and it's containers, this keeps you from having to install everything locally and provides an enterprise version of Neo4j to work with. 

# The Containers:

1. permits_ui - landservices_ui contains the base "create react app" piece of the project, the apollo client instance is already installed as well. Starts up on localhost:3000.
2. permits_api - containers the Apollo Server and GraphQL schema for the project, starts up on localhost:4001/graphql.
3. permits_neo4j - Docker's latest Neo4j Enterprise version, currently loads required plug-ins on load but, I need to find some different ways to handle that. Will persist data stored in the database. I need to work on seeding it, starts up on localhost:7474.

