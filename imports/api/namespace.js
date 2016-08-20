import { Meteor } from 'meteor/meteor';

export default Oroboro = {
  classes: {},
  db: {},
  api: {},
  Error: Meteor.Error,
  files: new Map(),
};
if(Meteor.isClient && Meteor.isDevelopment)
  window.Oroboro = window.oro = Oroboro;
