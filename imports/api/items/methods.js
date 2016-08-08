import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Items from './items';


const itemsInsert = new ValidatedMethod({
  name: 'items.insert',
  validate: Items.schema.validator(),
  run(obj) {
    delete obj._id;
    let id = Items.insert(obj);
    //console.log('inserted: ' + id);
    return id;
  }
});

const itemsUpdate = new ValidatedMethod({
  name: 'items.update',
  validate: null,
  run({ id, modifier }) {
    //console.log('updated: ' + id)
    //console.log(modifier)
    Items.update({_id: id}, {$set: modifier});
  }
});

const itemsDelete = new ValidatedMethod({
  name: 'items.delete',
  validate: null,
  run(id) {
    //console.log('delete: ' + id)
    Items.remove(id);
  }
});


export { itemsInsert };
Items.methods = {
  insert: itemsInsert,
  update: itemsUpdate,
  delete: itemsDelete,
};