import Files from './files/files';
import Dependencies from './dependencies/dependencies';
import Groups from './groups/groups';
import Items from './items/items';
import Users from './users/users';

import fileResolvers from './files/file-resolvers';
import dependencyResolvers from './dependencies/dependency-resolvers';
import groupResolvers from './groups/group-resolvers';
import itemResolvers from './items/item-resolvers';
import userResolvers from './users/user-resolvers';

const resolvers = Object.assign({}, 
  {
    Query: {
      file(root, args, context) {
        return Files.findOne(args.id);
      },
      dependency(root, args, context) {
        return Dependencies.findOne(args.id);
      },
      group(root, args, context) {
        return Groups.findOne(args.id);
      },
      item(root, args, context) {
        return Items.findOne(args.id);
      },
      user(root, args, context) {
        return Users.findOne(args.id);
      },
    }
  },
  fileResolvers,
  dependencyResolvers,
  groupResolvers,
  itemResolvers,
  userResolvers
);

export default resolvers;