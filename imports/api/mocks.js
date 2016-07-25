import fileMocks from './files/file-mocks';
import dependencyMocks from './dependencies/dependency-mocks';
import groupMocks from './groups/group-mocks';
import itemMocks from './items/item-mocks';
import userMocks from './users/user-mocks';

const mocks = Object.assign({},
  fileMocks,
  dependencyMocks,
  groupMocks,
  itemMocks,
  userMocks
);

export default mocks;