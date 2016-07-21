import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
import Files from './files';

const filesSchema = SchemaBridge.schema(Files.schema, 'File');

export default filesSchema;