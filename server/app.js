// require express
const express = require('express');
const expressGraphQL = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const cors = require('cors');

// create an app instance by invoking express function
const app = express();

// allow cross origin requests
app.use(cors());

// connect to mLab database
mongoose.connect('mongodb://gql-user:CCTpassword1!@ds141783.mlab.com:41783/gql-aspmvp');
mongoose.connection.once('open', () => {
    console.log('Connected to database');
});

app.use('/graphql', expressGraphQL({
    schema, // how our data look like (our graph look like)
    graphiql: true
}));

// tell the app to listen to requests on port 4000 on this machine
app.listen(4000, () => {
    console.log('Listening for requests on port 4000');
}); 