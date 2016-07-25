import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
import Dependencies from './dependencies';

const dependencySchema = SchemaBridge.schema(Dependencies.schema, 'Dependency');

export default dependencySchema;