import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
import Groups from './groups';

const groupMocks = SchemaBridge.mocks(Groups.schema, 'Group');

export default groupMocks;