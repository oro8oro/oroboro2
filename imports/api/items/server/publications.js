import { Meteor } from 'meteor/meteor';
import Items from '../items';

Meteor.publish('Items.general', function () {
  //console.log('items general: ' + Items.find().count())
  return Items.find();
});
