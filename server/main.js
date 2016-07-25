import { Meteor } from 'meteor/meteor';
import { createApolloServer } from 'meteor/apollo';

import '../imports/startup/server/index.js';

import schema from '../imports/api/schema';
import resolvers from '../imports/api/resolvers';
import mocks from '../imports/api/mocks';

//console.log(schema)
//console.log(resolvers)
//console.log(mocks)

createApolloServer({
    graphiql: true,
    pretty: true,
    schema,
    resolvers,
    //mocks: mocks
    //connectors,
    //models,
    //context
});

Meteor.startup(() => {
  // code to run on server at startup
});
