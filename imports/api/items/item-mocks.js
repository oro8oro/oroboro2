import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
import Items from './items';

const itemMocks = SchemaBridge.mocks(Items.schema, 'Item');

export default itemMocks;