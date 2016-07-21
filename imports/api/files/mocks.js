import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
import Files from './files';

const filesMocks = SchemaBridge.mocks(Files.schema, 'File');

export default filesMocks;