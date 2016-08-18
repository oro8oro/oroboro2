import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Files from './files';


const filesInsert = new ValidatedMethod({
  name: 'files.insert',
  validate: Files.schema.validator(),
  run(obj) {
    delete obj._id;
    let id = Files.insert(obj);
    console.log('inserted: ' + id);
    return id;
  }
});

const filesUpdate = new ValidatedMethod({
  name: 'files.update',
  validate: null,
  run({ id, modifier }) {
    //console.log('updated: ' + id)
    console.log('modifier: ', modifier)
    //console.log('simulation: ', this.isSimulation)
    //if (!this.isSimulation) {
      //console.log('changing')
      Files.update({_id: id}, {$set: modifier});
    //}
  }
});

const filesDelete = new ValidatedMethod({
  name: 'files.delete',
  validate: null,
  run(id) {
    console.log('delete: ' + id)
    Files.remove(id);
  }
});


export { filesInsert };
Files.methods = {
  insert: filesInsert,
  update: filesUpdate,
  delete: filesDelete,
};