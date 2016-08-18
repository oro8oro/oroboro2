// This defines all the collections, publications and methods that the application provides

import Files from './files/files';
import Groups from './groups/groups';
import Items from './items/items';
import Dependencies from './dependencies/dependencies';
import Users from './users/users';

if(Meteor.isServer) {
  require('./files/server/publications.js');
  //require('./files/server/routes.js');
  

  require('./groups/server/publications.js');
  //require('./groups/server/routes.js');
  

  require('./items/server/publications.js');
  require('./items/server/routes.js');
  require('./items/methods.js');
}

require('./files/methods.js');
require('./groups/methods.js');

import './classes.js';

import Oroboro from './namespace';

let db = Oroboro.db = {
  Files,
  Groups,
  Items,
  Dependencies,
  Users
};

const UI_ROOT = "oroboroApp";

export { db, UI_ROOT };