import Oroboro from '../../namespace';
import Common from '../../../utils/Common';
import '../methods';

class File extends Common {
  constructor(doc, parent) {
    super(doc, parent);
    Oroboro.files.set(doc._id, this);
  }

  static mimes() {
    return {
      'svg': 'image/svg+xml',
      'js': 'application/javascript',
      'css': 'text/css',
      'json': 'application/json',
      'md': 'text/plain',
      'txt': 'text/plain',
      'gcode': 'text/plain',
      'jpeg': 'image/jpeg',
      'jpg': 'image/jpeg',
      'png': 'image/png',
      'bmp': 'image/bmp',
      'gif': 'image/gif',
      'html': 'text/html',
      'csv': 'text/plain',
      'tsv': 'text/plain',
      'uml': 'text/plain',
      'seq': 'text/plain',
      'bvh': 'application/octet-stream',
      'obj': 'application/octet-stream',
      'stl': 'application/sla',
      'woff': 'application/font-woff',
      'woff2': 'application/font-woff2',
      'otf': 'application/x-font-opentype',
      'tff': 'application/x-font-truetype',
      'eot': 'application/vnd.ms-fontobject',
      'xml': 'application/xml',
      'mid': 'application/x-midi',
      'wav': 'audio/wav',
      'mp3': 'audio/mp3',
      'ogg': 'audio/ogg'
    }
  }

  static mime(extension) {
    return File.mimes()[extension]
  }

}


export default File;
Oroboro.classes.File = File;