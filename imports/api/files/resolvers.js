import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
import Files from './files';

const filesResolvers = SchemaBridge.resolvers(Files.schema, 'File');

export default filesResolvers;