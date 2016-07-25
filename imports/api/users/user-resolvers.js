import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
import Users from './users';

const userResolvers = SchemaBridge.resolvers(Users.schema, 'User');

export default userResolvers;