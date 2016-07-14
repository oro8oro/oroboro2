import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const Dependencies = new Mongo.Collection('Dependencies');
const cols = ['Files', 'Groups', 'Items'];

Dependencies.schema = new SimpleSchema({
  fileId1: {
      type: String,
      label: 'File Id 1',
  },
  collection1:{
      type: String,
      label: 'Collection1',
      optional: true,
      allowedValues: cols
  },
  fileId2: {
      type: String,
      label: 'Parent File',
  },
  collection2:{
      type: String,
      label: 'Collection2',
      optional: true,
      allowedValues: cols
  },
  type: {
      type: Number,
      label: 'Type',
      allowedValues: [1,2,3,4,5,6,7]
  },
  parameters: {
      type: Object,
      label: 'Parameters',
      optional: true,
      blackbox: true
  }
});
Dependencies.attachSchema(Dependencies.schema);

export default Dependencies;