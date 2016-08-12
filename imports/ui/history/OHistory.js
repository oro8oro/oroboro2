import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Oroboro from '../../api/namespace';
import Items from '../../api/items/items.js';
import ItemFactory from '../../api/items/ItemFactory';

import SVG from 'svg.js';

import '../OSVG';
import './OHistory.html';

Template.OHistory.onCreated(function() {
  this.container = 'OHistory';
  this.layers = [];

  this.autorun(() => {
    this.type = FlowRouter.getParam('type');
    this._id = FlowRouter.getParam('id');
    this.duration = parseInt(FlowRouter.getQueryParam('duration') || 1000);
    this.itemHandle = this.subscribe('Items.item', this._id);
  });
});

Template.OHistory.onRendered(function() {
  this.autorun(() => {
    let doc = Items.findOne(this._id);
    if(!doc)
      return;
    console.log(doc);
    let { chain, index } = doc.mem;
    chain = JSON.parse(chain);
    let inst = ItemFactory(doc);

    this.remove();
    // Last chain state is first - we REVERSE the order
    this.layers = chain.reverse().map((m) => {
      let g = SVG(this.container).group()
        .attr('timestamp', m.timestamp)
        .opacity(0);
      inst.draw(g, true);
      inst.undo({ update: false });
      return g;
    });
    // We have to reverse the index
    this.index = chain.length-1 - index;

    this.animate();
  });

  this.remove = () => {
    this.layers.forEach(l => {
      l.remove();
    });
  };

  this.animate = () => {
    let d = this.duration;

    this.layers.forEach((l, i) => {
      // Do not go through redo states
      if(i < this.index)
        return;
      l.animate(d, '>', d*i).opacity(1);
      this.layers.forEach((ll, j) => {
        if(j != i)
          ll.animate(d, '>', d*i).opacity(0);
      });
    });
  };
});

Template.OHistory.helpers({
  id: () => Template.instance().container,
})