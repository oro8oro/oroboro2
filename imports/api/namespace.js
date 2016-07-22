export default Oroboro = {
  classes: {},
  db: {},
  // { _id: classInstance } for client observables
  waitOn: {},
};
if(Meteor.isClient && Meteor.isDevelopment)
  window.Oroboro = Oroboro;