import Oroboro from '../../namespace';
import Common from '../../../utils/Common';
import '../methods';


class Group extends Common {
  draw(parent) {
    this._parent = this._parent || parent;
    this._svg = parent.group().attr('id', this._id);
  }
}


export default Group;
Oroboro.classes.Group = Group;