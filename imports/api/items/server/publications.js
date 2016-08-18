import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Items from '../items';

Meteor.publish('Items.general', function () {
  //console.log('items general: ' + Items.find().count())
  return Items.find({_id: {$ne: "WjvLagaMJMhXP2Yzb"}}, {
    disableOplog: true,
    pollingIntervalMs: 10000, // default 10 milisec
    pollingThrottleMs: 10000,// default 50 milisec
  });
});

Meteor.publish('Items.item', function (id) {
  check(id, String);
  //console.log('items general: ' + Items.find().count())
  return Items.find({_id: id});
});

Meteor.publish('Groups.items', function (id) {
  check(id, String);
  return Items.find({group: id});
});