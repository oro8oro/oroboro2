import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import '../../ui/editor/OEditor';
import '../../ui/browser/OBrowser';
import '../../ui/history/OHistory';

FlowRouter.route('/editor/:file', {
  action: function() {
    BlazeLayout.render('OEditor');
  }
});

FlowRouter.route('/browser', {
  action: function() {
    BlazeLayout.render('OBrowser');
  }
});

FlowRouter.route('/history/:type/:id', {
  action: function() {
    BlazeLayout.render('OHistory');
  }
});