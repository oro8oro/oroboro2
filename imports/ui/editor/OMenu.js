import { Meteor } from 'meteor/meteor';
import ItemFactory from '../../api/items/ItemFactory';
import '../helpers.js';
import './OMenu.html';

Template.OMenu.onCreated(function() {
  this.freePathStatus = new ReactiveVar('start');
});

Template.OMenu.helpers({
  options: () => {
    return [
      'simple',
      'spiro',
      'algo1'
    ];
  },
  freePathStatus: () => {
    let inst = Template.instance();
    return inst.freePathStatus.get();
  }
});

Template.OMenu.events({
  'click #deleteButton': (e, inst) => {
    let { editor } = Template.currentData();
    if(editor.selected) {
      editor.selected.remove({ db:true });
      editor.clearSelector();
    }
  },
  'click #freePath': (e, inst) => {

  },
  'change #svgInput': (e, inst) => {
    let svgSource = $(e.target).val(),
      { editor } = Template.currentData();
    if(!svgSource)
      return;
    editor.setSource(svgSource);
  }
});