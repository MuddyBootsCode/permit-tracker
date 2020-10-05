# Permit Tracker

The project is currently dockerized. To get started run in the terminal do these TWO things:

1. cd into the "client" folder and run "yarn install" cd .. back into the main folder
2. in the terminal run "docker-compose up". 


This will build the project and it's containers, this keeps you from having to install everything locally and provides an enterprise version of Neo4j to work with. 

# The Containers:

1. permits_ui - landservices_ui contains the base "create react app" piece of the project, the apollo client instance is already installed as well. Starts up on localhost:3000.
2. permits_api - containers the Apollo Server and GraphQL schema for the project, starts up on localhost:4001/graphql.
3. permits_neo4j - Docker's latest Neo4j Enterprise version, currently loads requried plug-ins on load but I need to find some different ways to handle that. Will persist data stored in the database. Starts up on localhost:7474.

# Getting Permit Data Into Neo4j

1. cd into the neo4j director and run:
   ```
   docker cp permit_tryout_csv.csv permits_neo4j:/var/lib/neo4j/import
   ```
   This will copy the csv file into the import directory of the neo4j container, where we can then import it.
2. Then open your neo4j browser and paste this command, ensure multiline query editor is enabled:
   ```
   create constraint on (p:Permit) assert p.PermitID is unique;
   create constraint on (s:State) assert s.name is unique;
   create constraint on (c:County) assert c.name is unique;
   
   CALL apoc.load.csv('permit_tryout_csv.csv')
   YIELD map as permit
   CREATE (p:Permit {id: permit['PermitID']}) with p, permit
   UNWIND keys(permit) as key
   CALL apoc.create.setProperty(p, key, permit[key])
   YIELD node as n
   MERGE (s:State {name: 'TEXAS'})
   MERGE (n)-[:FILED_IN_STATE]->(s)
   MERGE (c:County {name: "Midland"})
   MERGE (n)-[:FILED_IN_COUNTY]->(c)
   RETURN n;
   
   MATCH (p:Permit)
   WHERE p.SubmittedDate IS NOT NULL
   MERGE (s:SubmittedDate {date: p.SubmittedDate})
   MERGE (p)-[:SUBMITTED_ON]->(s);
   
   MATCH (p:Permit)
   WHERE p.ApprovedDate is not null
   MERGE (a:ApprovedDate {date: p.ApprovedDate})
   MERGE (p)-[:APPROVED_ON]->(a);
   ```
  This will populate the local data base with our permit data
   