import SchemaBridge from 'meteor/kuip:schema-graphql-bridge';
import Items from './items';

const itemResolvers = SchemaBridge.resolvers(Items.schema, 'Item');

export default itemResolvers;