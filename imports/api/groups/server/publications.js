import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Groups from '../groups';


Meteor.publish('Groups.one', function (id) {
  check(id, String);
  return Groups.find({_id: id});
});