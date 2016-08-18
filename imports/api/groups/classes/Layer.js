import Oroboro from '../../namespace';
import Common from '../../../utils/Common';
import '../methods';


class Layer extends Common {
  draw(parent) {
    this._parent = this._parent || parent;
    this._svg = parent.group().attr('id', 'Layer_'+this._id);
  }
}


export default Layer;
Oroboro.classes.Layer = Layer;