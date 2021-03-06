import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Groups from './groups';
import Files from '../files/files';


const groupsInsert = new ValidatedMethod({
  name: 'groups.insert',
  validate: null,
  run({ obj, file }) {
    delete obj._id;
    let id = Groups.insert(obj);

    if(!this.isSimulation) {
      Files.update({ 
        _id: file 
      }, {
        $addToSet: { 'groups': id }
      });
    }

    console.log('inserted: ' + id);
    return id;
  }
});

const groupsUpdate = new ValidatedMethod({
  name: 'groups.update',
  validate: null,
  run({ id, modifier }) {
    //console.log('updated: ' + id)
    console.log('modifier: ', modifier)
    //console.log('simulation: ', this.isSimulation)
    //if (!this.isSimulation) {
      //console.log('changing')
      Groups.update({_id: id}, {$set: modifier});
    //}
  }
});

const groupsRemove = new ValidatedMethod({
  name: 'groups.remove',
  validate: null,
  run(id) {
    console.log('delete: ' + id)
    Groups.remove(id);
  }
});


export { groupsInsert };
Groups.methods = {
  insert: groupsInsert,
  update: groupsUpdate,
  remove: groupsRemove,
};