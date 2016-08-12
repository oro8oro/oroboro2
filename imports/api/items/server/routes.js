import { Picker } from 'meteor/meteorhacks:picker';
import Items from '../items';

Picker.route('/api/item/:_id/:scale?', function(params, req, res, next) {
  let it = Items.findOne(params._id),
    headers = {'Content-type': 'image/svg+xml', 'Access-Control-Allow-Origin' : '*'},
    file = { width: 1448, height: 1024 },
    layer = {},
    scale = params.scale || 1;
  
  let script = it.cache;
  script = `<svg width="${ file.width*scale }" height="${ file.height*scale }" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="${ file._id }"><g id="viewport" transform="matrix(${ scale } 0 0 ${ scale } 0 0)"><g id="${ layer._id }" type="${ layer.type }">${ script }</g></g></svg>`;

  res.writeHead(200, headers);
  res.end(script);
});