import { Meteor } from 'meteor/meteor';
import 'meteor/reywood:publish-composite';
import { check } from 'meteor/check';
import Files from '../files';
import Groups from '../../groups/groups';
import Items from '../../items/items';

Meteor.publishComposite('Files.file', function (id) {
  console.log('Files.file', id)
  check(id, String);

  return {
    find: function() {
      console.log(Files.findOne({_id: id}))
      return Files.find({_id: id});
    },
    children: [
      {
        find: function(f) {
          console.log('groups', Groups.find({_id: {$in: f.groups}}).count())
          return Groups.find({_id: {$in: f.groups}});
        }
      },
      {
        find: function(f) {
          console.log('items', Items.find({_id: {$in: f.items}}).count())
          return Items.find({_id: {$in: f.items}});
        }
      }
    ]
  }
});
