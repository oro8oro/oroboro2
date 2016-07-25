import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
import Dependencies from './dependencies';

const dependencyMocks = SchemaBridge.mocks(Dependencies.schema, 'Dependency');

export default dependencyMocks;