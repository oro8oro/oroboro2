import { Meteor } from 'meteor/meteor';
import { browserHistory } from 'react-router'
import Items from '../../api/items/items.js';
import { createContainer } from 'meteor/react-meteor-data';
import App from '../components/App.jsx';


export default AppContainer = createContainer(({ params, location }) => {
  const qHandle = Meteor.subscribe('Items.general');
  const loading = !qHandle.ready();
  let addedItems = [], removedItems = [];
  Items.find({}).observe({
    added: (doc) => {
      addedItems.push(doc);
    },
    removed: (doc) => {
      removedItems.push(doc._id);
    }
  });
  const notEmpty = !loading && addedItems.length > 0;
  return {
    addedItems,
    removedItems,
    notEmpty,
    connected: Meteor.status().connected,
  };
}, App);