import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const Groups = new Mongo.Collection('Groups');

let Types = [
  'Group',
  'Layer'
];

//['menu', 'menu_item', 'menu_button', 'layer', 'simpleGroup', 'linkedGroup', 'parametrizedGroup']

Groups.schema = new SimpleSchema({
  uuid: {
      type: String,
      label: 'Subject',
      optional: true,
  },
  file: {
      type: String,
      label: 'File Id',
      optional: true,
  },
  group: {
      type: String,
      label: 'Group Id',
      optional: true,
  },
  type: {
      type: String,
      label: 'Type',
      optional: true,
      allowedValues: Types,
  },
  ordering: {
      type: Number,
      label: 'Ordering',
      optional: true,
      defaultValue: 100,
  },
  selected: {
      type: String,
      label: 'Selected',
      optional: true,
      defaultValue: 'null',
  },
  locked: {
      type: String,
      label: 'Locked',
      optional: true,
      defaultValue: 'null',
  },
  transform: {
      type: String,
      label: 'Transform',
      optional: true,
  },
  parameters: {
      type: Object,
      label: 'Parameters',
      optional: true,
      blackbox: true,
  },
  transparency: {
      type: Number,
      label: 'Transparency',
      optional: true,
      decimal: true,
  },
  original: {
      type: String,
      label: 'Original',
      optional: true,
  },
});
Groups.attachSchema(Groups.schema);

export default Groups;