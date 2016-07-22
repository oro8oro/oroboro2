import { Meteor } from 'meteor/meteor';
import { browserHistory } from 'react-router'
import Items from '../../api/items/items.js';
import { createContainer } from 'meteor/react-meteor-data';
import AppComponent from '../components/AppComponent.jsx';


export default AppContainer = createContainer(({ params, location }) => {
  const qHandle = Meteor.subscribe('Items.general');
  const loading = !qHandle.ready();
  const items = Items.find({}).fetch();
  const notEmpty = !loading && items.length > 0;
  return {
    items,
    notEmpty,
    connected: Meteor.status().connected,
  };
}, AppComponent);