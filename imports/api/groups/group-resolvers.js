import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
import Groups from './groups';

const groupResolvers = SchemaBridge.resolvers(Groups.schema, 'Group');

export default groupResolvers;