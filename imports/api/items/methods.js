import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Items from './items';
import Files from '../files/files';


const itemsInsert = new ValidatedMethod({
  name: 'items.insert',
  validate: null,
  run({ obj, fileId }) {
    if(!fileId)
      throw new Meteor.Error('Items.methods.insert.noFileId', 'Must provide file id.');
    delete obj._id;
    let id = Items.insert(obj);
    console.log('inserted: ' + id);
    if(!this.isSimulation) {
      Files.update({ 
        _id: fileId 
      }, {
        $addToSet: { 'items': id }
      });
    }
    return id;
  }
});

const itemsClone = new ValidatedMethod({
  name: 'items.clone',
  validate: null,
  run(id, groupId, fileId) {
    let obj = Items.findOne(id);
    if(!obj)
      return;
    delete obj._id;
    obj.original = id;
    if(groupId)
      obj.group = groupId;
    obj._id = Items.insert(obj);
    if(!this.isSimulation) {
      Files.update({ 
        _id: fileId 
      }, {
        $addToSet: { 'items': obj._id }
      });
    }
    console.log('clone: ' + obj._id);
    return obj;
  }
});

const itemsUpdate = new ValidatedMethod({
  name: 'items.update',
  validate: null,
  run({ id, modifier }) {
    //console.log('updated: ' + id)
    console.log('modifier: ', modifier)
    //console.log('simulation: ', this.isSimulation)
    //if (!this.isSimulation) {
      //console.log('changing')
      Items.update({_id: id}, {$set: modifier});
    //}
  }
});

const itemsRemove = new ValidatedMethod({
  name: 'items.remove',
  validate: null,
  run({ id, fileId }) {
    console.log('delete: ' + id)
    Items.remove(id);
    if(fileId && !this.isSimulation) {
      Files.update({ 
        _id: fileId 
      }, {
        $pull: { 'items': id }
      });
    }
  }
});

const addActor = new ValidatedMethod({
  name: 'items.addActor',
  validate: null,
  run({ group, file }) {
    console.log(group, file)
    let obj = Items.findOne('QA8cpnLnjsufBmZWS') || Items.findOne({ type: 'Actor' });
    if(!obj)
      return;
    obj.original = obj._id;
    delete obj._id;
    if(group)
      obj.group = group;
    obj._id = Items.insert(obj);
    if(!this.isSimulation) {
      console.log('updateFile ', file, JSON.stringify({
        $addToSet: { 'items': obj._id }
      }));
      Files.update({ 
        _id: file 
      }, {
        $addToSet: { 'items': obj._id }
      });
    }
    console.log('addActor: ' + obj._id);
    return obj;
  }
});


const addDialog = new ValidatedMethod({
  name: 'items.addDialog',
  validate: null,
  run({ group, file }) {
    console.log(group, file)
    let obj = Items.findOne('rYGxWGGEGnTx2nbKC') || Items.findOne({ type: 'SimpleDialog' });
    if(!obj)
      return;
    
    let text = Items.findOne(obj.text);
    text.original = text._id;
    delete text._id;
    if(group)
      text.group = group;
  
    obj.text = Items.insert(text);
    obj.original = obj._id;
    delete obj._id;
    if(group)
      obj.group = group;
    obj._id = Items.insert(obj);


    if(!this.isSimulation) {
      Files.update({ 
        _id: file 
      }, {
        $addToSet: { 'items': { $each: [obj._id, obj.text] } }
      });
    }
    console.log('addDialog: ', obj._id, obj.text);
    return obj;
  }
});

Items.methods = {
  insert: itemsInsert,
  update: itemsUpdate,
  remove: itemsRemove,
  clone: itemsClone,
  addActor: addActor,
  addDialog: addDialog,
};