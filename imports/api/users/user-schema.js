import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
import Users from './users';

const userSchema = SchemaBridge.schema(Users.schema, 'User');

export default userSchema;