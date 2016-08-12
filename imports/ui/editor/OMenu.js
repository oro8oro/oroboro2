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

  },
  'click #freePath': (e, inst) => {

  },
  'change #svgInput': (e, inst) => {
    let svgSource = $(e.target).val(),
      editor = Template.currentData().editor;
    if(!svgSource)
      return;
    ItemFactory({ 
      type: 'SimplePath', closed: true,
      cache: svgSource
    }, SVG(editor));
  }
});