const express = require('express');
const path = require('path');
const { authMiddleware } = require('./utils/auth');
// const routes = require('./routes');
const PORT = process.env.PORT || 3001;
// import ApolloServer
const { ApolloServer } = require('apollo-server-express');

// import our typeDefs and resolvers 
const { typeDefs, resolvers } = require('./schemas')
const db = require('./config/connection');

// create a new Apollo server and pass in our schema data 
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});


const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// Creates a new instance of an Apollo Server with the GraphQL schema 
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  // integrate our apollo server with the Express application as middleware
  server.applyMiddleware({ app })
  
  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
    
  app.get('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, './public/404.html'));
  });
  
  db.once('open', () => {
    app.listen(PORT, () => 
      console.log(`🌍 Now listening on localhost:${PORT}`));

      // log where we can go to test our GraphQL API
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
};


// Call the async function to start the server 
startApolloServer(typeDefs, resolvers);