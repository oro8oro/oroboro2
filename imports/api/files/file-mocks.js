import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
import Files from './files';

const fileMocks = SchemaBridge.mocks(Files.schema, 'File');

export default fileMocks;