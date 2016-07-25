import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
import Groups from './groups';

const groupSchema = SchemaBridge.schema(Groups.schema, 'Group');

export default groupSchema;