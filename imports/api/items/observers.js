import Items from './items';
import Oroboro from '../namespace';

let { waitOn } = Oroboro;


Items.observe = (query={}, options={}) => {
  Item.find(query, options).observe({
    /*added: function(doc) {
      if(waitOn[doc._id])

    }*/
  });
};