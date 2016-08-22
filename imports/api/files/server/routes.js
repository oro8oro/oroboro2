import { Picker } from 'meteor/meteorhacks:picker';
import Files from '../files';

Picker.route('/api/file/:_id/:scale?', function(params, req, res, next) {
  let file = Files.findOne(params._id),
    headers = {'Content-type': 'image/svg+xml', 'Access-Control-Allow-Origin' : '*'},
    scale = params.scale || 1;
  
  let script = `<svg width="${ file.width*scale }" height="${ file.height*scale }" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="${ file._id }"><g id="viewport" transform="matrix(${ scale } 0 0 ${ scale } 0 0)">${ file.cache }</g></svg>`;

  res.writeHead(200, headers);
  res.end(script);
});