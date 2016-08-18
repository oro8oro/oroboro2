import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const Items = new Mongo.Collection('Items');

const itemTypes = [
  'CubicPath', 
  'CubicOpenType',
  'SimplePath',
  'SimpleDialog',
  'Actor',
]

//'para_simple_path', 'para_complex_path', 'text', 'rasterImage', 'formulae', 'embeddediFrame', 'embeddedCanvas', 'embeddedHtml', 'nestedSvg', 'qrcode', 'gradient', 'markdown', 'pathEquation'];

Items.schema = new SimpleSchema({
  _id: {
    type: String,
    optional: true,
  },
  group: {
      type: String,
      label: 'Group Id',
  },
  type: {
      type: String,
      label: 'Type',
      allowedValues: itemTypes,
  },
  text: {
      type: String,
      label: 'Text',
      optional: true,
  },
  ordering: {
      type: Number,
      label: 'Ordering',
      optional: true,
      defaultValue: 100,
  },
  palette:{
      type: Object,
      label: 'Palette',
      optional: true,
      blackbox: true,
  },
  'palette.strokeColor': {
      type: String,
      label: 'Stroke Color',
      optional: true,
      defaultValue: '#000000',
  },
  'palette.strokeWidth': {
      type: String,
      label: 'Stroke Width',
      optional: true,
      decimal: true,
      defaultValue: '1',
  },
  'palette.strokeOpacity': {
      type: String,
      label: 'Stroke Opacity',
      optional: true,
      decimal: true,
      defaultValue: '1',
  },
  'palette.fillColor': {
      type: String,
      label: 'Fill Color',
      optional: true,
      defaultValue: '#000000',
  },
  'palette.fillOpacity': {
      type: String,
      label: 'Fill Opacity',
      optional: true,
      decimal: true,
      defaultValue: '1',
  },
  'palette.strokeDasharray': {
      type: String,
      label: 'Dash Array',
      optional: true,
  },
  'palette.strokeLinejoin': {
      type: String,
      label: 'Stroke Linejoin',
      optional: true,
      allowedValues: ['bevel', 'round', 'miter'],
  },
  'palette.strokeLinecap': {
      type: String,
      label: 'Stroke Linecap',
      optional: true,
      allowedValues: ['square', 'round', 'butt'],
  },
  'palette.opacity': {
      type: String,
      label: 'General Opacity',
      optional: true,
      decimal: true,
      defaultValue: '1'
  },
  font:{
      type: Object,
      label: 'Font',
      optional: true,
      blackbox: true,
  },
  'font.style': {
      type: String,
      label: 'Font Style',
      optional: true,
      allowedValues: ['normal', 'italic'],
  },
  'font.weight': {
      type: String,
      label: 'Font Weight',
      optional: true,
      allowedValues: ['normal', 'bold'],
  },
  'font.family': {
      type: String,
      label: 'Font Family',
      optional: true,
      allowedValues: ['serif', 'Sans-serif', 'Cursive', 'Fantasy', 'Monospace'],
  },
  'font.size': {
      type: String,
      label: 'Font Size',
      optional: true,
  },
  'font.textAnchor': {
      type: String,
      label: 'Text Anchor',
      optional: true,
      allowedValues: ['start', 'middle', 'end'],
  },
  complexity: {
      type: Number,
      label: 'Complexity',
      optional: true,
      decimal: true,
  },
  pointList: {
      type: String,
      label: 'List of Points',
      optional: true,
  },
  closed: {
      type: Boolean,
      label: 'Closed',
      optional: true,
      allowedValues: [true, false],
  },
  selected: {
      type: Boolean,
      label: 'Selected',
      defaultValue: false,
      optional: true
  },
  locked: {
      type: Boolean,
      label: 'Locked',
      optional: true,
      defaultValue: false,
  },
  parameters: {
      type: Object,
      label: 'Parameters',
      optional: true,
      blackbox: true,
  },
  original: {
      type: String,
      label: 'Original',
      optional: true,
  },
  linkto: {
      type: String,
      label: 'Link To',
      optional: true,
  },
  pathArray: {
    type: String,
    optional: true,
  },
  cache: {
    type: String,
    label: 'Cache',
    optional: true,
  },
  defs: {
    type: Boolean,
    label: 'Defs',
    optional: true,
  },
  mem: {
    type: Object,
    label: "Memory",
    optional: true,
  },
  'mem.chain': {
    type: String,
    label: "Memory Chain",
    defaultValue: '[]',
  },
  'mem.index': {
    type: Number,
    label: 'Memory Index',
    defaultValue: -1,
  }
});
Items.attachSchema(Items.schema);

export default Items;