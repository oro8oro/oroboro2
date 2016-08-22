import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import SVG from 'svg.js';
import Oroboro from '../../api/namespace';
import Files from '../../api/files/files';

import './OBrowser.html';

Template.OBrowser.onCreated(function() {

  this.autorun(() => {
    this._no = FlowRouter.getQueryParam('no') || 7;
    console.log('no',this._no)
  });

  this.autorun(() => {
    this.handleFiles = this.subscribe('Files.general');
  });
});

Template.OBrowser.onRendered(function() {
  let dim = [1448, 1024]
  this._svg = SVG('OBrowser').size(dim[0],dim[1]);
  this._gr = this._svg.group();
  this._images = []

  this.show_files = (ids) => {
    let no = this._no;
    ids.forEach((id, ndx) => {
      let url = '/api/file/'+id;
      this._images[ndx] = this._gr.image(url).loaded(function(loader) {})
      this._images[ndx].size(dim[0]/no,dim[1]/no)
        .x(dim[0]/no*(ndx%no)).y(dim[1]/no*Math.floor(ndx/no))
        .on('click', () => {
          window.open('/editor/'+id, '_blank');
        });
    });
  }

  this.autorun(() => {
    this._files = Files.find().fetch();
    console.log(this._files);
    this._gr.clear();
    this.show_files(this._files.map(f => { return f._id; }));
  })
});