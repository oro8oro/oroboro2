import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
import Users from './users';

const userMocks = SchemaBridge.mocks(Users.schema, 'User');

export default userMocks;