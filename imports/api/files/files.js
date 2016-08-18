import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const Files = new Mongo.Collection('Files');

const fileTypes = ['application/javascript', 'image/svg+xml', 'image/png', 'image/jpeg', 'text/css', 'text/plain', 'application/octet-stream', 'gcode']

Files.schema = new SimpleSchema({
  uuid: {
      type: String,
      label: 'Subject',
      optional: true,
  },
  title: {
      type: String,
      label: 'Title',
      optional: true,
  },
  fileType: {
    type: String,
    label: 'File Type',
    allowedValues: fileTypes,
  },
  width: {
      type: Number,
      label: 'Width',
      optional: true,
      decimal: true,
  },
  height: {
      type: Number,
      label: 'Height',
      optional: true,
      decimal: true,
  },
  dateModified: {
      type: Date,
      label: 'Date Modified',
      defaultValue: new Date(),
      optional: true,
  },
  dateCreated: {
      type: Date,
      label: 'Date Created',
      defaultValue: new Date(),
      optional: true,
  },
  version: {
      type: String,
      label: 'Version',
      max: 200,
      defaultValue: '1',
      optional: true,
  },
  script: {
      type: String,
      label: 'Script',
      optional: true,
      trim: false,
  },
  permissions: {
      type: Object,
      label: 'Permissions',
      optional: true,
      blackbox: true,
  },
  'permissions.view': {
      type: [String],
      label: 'View Permissions',
      optional: true,
      defaultValue: [],
  },
  'permissions.edit': {
      type: [String],
      label: 'View Permissions',
      optional: true,
  },
  creator: {
      type: String,
      label: 'Creator',
      max: 200,
      optional: true,
  },
  locked: {
      type: String,
      label: 'Locked',
      optional: true,
  },
  selected: {
      type: [String],
      label: 'Selected',
      optional: true,
      defaultValue: [],
  },
  noofchildren: {
      type: Number,
      label: 'No of children',
      optional: true,
      defaultValue: 0,
  },
  structuralpath: {
      type: [String],
      label: 'Structural Path',
      optional: true,
      defaultValue: [],
  },
  dependencypath: {
      type: [String],
      label: 'Dependency Path',
      optional: true,
      defaultValue: [],
  },
  groups: {
      type: [String],
      label: 'Group Ids',
      optional: true,
  },
  items: {
      type: [String],
      label: 'Item Ids',
      optional: true,
  },
  original: {
      type: String,
      label: 'Original',
      optional: true,
  },
  parameters: {
      type: Object,
      label: 'Parameters',
      optional: true,
      blackbox: true,
  },
  ordering: {
    type: Number,
    optional: true,
  },
  cache: {
    type: String,
    optional: true,
  },
});
Files.attachSchema(Files.schema);

export default Files;