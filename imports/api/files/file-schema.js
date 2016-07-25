import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
import Files from './files';

const fileSchema = SchemaBridge.schema(Files.schema, 'File');

export default fileSchema;