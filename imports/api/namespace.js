import { Meteor } from 'meteor/meteor';

export default Oroboro = {
  classes: {},
  db: {},
  // { _id: classInstance } for client observables
  waitOn: {},
  Error: Meteor.Error,
};
if(Meteor.isClient && Meteor.isDevelopment)
  window.Oroboro = window.oro = Oroboro;
