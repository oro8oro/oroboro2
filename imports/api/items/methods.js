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
    return id;
  }
});


export { itemsInsert };
Items.methods = {
  insert: itemsInsert,
};