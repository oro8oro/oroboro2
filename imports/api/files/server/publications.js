import { Meteor } from 'meteor/meteor';
import 'meteor/reywood:publish-composite';
import { check } from 'meteor/check';
import Files from '../files';
import Groups from '../../groups/groups';
import Items from '../../items/items';

let rate = {
  disableOplog: true,
  pollingIntervalMs: 100, // default 10 milisec
  pollingThrottleMs: 100,// default 50 milisec
}

Meteor.publishComposite('Files.SvgFile.defs', function (id) {
  check(id, String);

  return {
    find: function() {
      return Files.find({_id: id});
    },
    children: [
      {
        find: function(f) {
          return Groups.find({_id: {$in: f.groups}, defs: true});
        }
      },
      {
        find: function(f) {
          return Items.find({_id: {$in: f.items}, defs: true});
        }
      }
    ]
  }
});

Meteor.publishComposite('Files.SvgFile.nodefs', function (id) {
  check(id, String);

  return {
    find: function() {
      return Files.find({_id: id});
    },
    children: [
      {
        find: function(f) {
          console.log('Groups changed')
          return Groups.find({
            _id: {$in: f.groups}, 
            $or: [ {defs: {$exists: 0}}, {defs: false} ]
          });
        }
      },
      {
        find: function(f) {
          console.log('Items changed')
          return Items.find({
            _id: {$in: f.items}, 
            $or: [ {defs: {$exists: 0}}, {defs: false} ]
          });
        }
      }
    ]
  }
});