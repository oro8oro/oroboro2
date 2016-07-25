import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
import Items from './items';

const itemSchema = SchemaBridge.schema(Items.schema, 'Item');

export default itemSchema;