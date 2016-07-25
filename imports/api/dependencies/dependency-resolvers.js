import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
import Dependencies from './dependencies';

const dependencyResolvers = SchemaBridge.resolvers(Dependencies.schema, 'Dependency');

export default dependencyResolvers;