import { Meteor } from 'meteor/meteor';
import { createApolloServer } from 'meteor/apollo';

import '../imports/startup/server/index.js';

/*import filesSchema from '../imports/api/files/schema';
import filesResolvers from '../imports/api/files/resolvers';
import filesMocks from '../imports/api/files/mocks';

const schema = [`
  ${filesSchema}

  type Query {
    file(id: String!): File
  }

  schema {
    query: Query
  }

`]

const resolvers = {
  Query: {
    file(root, args, context) {
      return filesMocks.File
    }
  },
  //File: filesResolvers.File
}

//console.log(schema)
//console.log(resolvers)
//console.log(filesMocks)

createApolloServer({
    graphiql: true,
    pretty: true,
    schema,
    resolvers,
    mocks: filesMocks
    //connectors,
    //models,
    //context
});*/

Meteor.startup(() => {
  // code to run on server at startup
});
