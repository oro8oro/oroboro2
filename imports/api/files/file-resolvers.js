import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
import Files from './files';

const fileResolvers = SchemaBridge.resolvers(Files.schema, 'File');

export default fileResolvers;