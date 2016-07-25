import fileSchema from './files/file-schema';
import dependencySchema from './dependencies/dependency-schema';
import groupSchema from './groups/group-schema';
import itemSchema from './items/item-schema';
import userSchema from './users/user-schema';

const schema = [`
  ${fileSchema}
  ${dependencySchema}
  ${groupSchema}
  ${itemSchema}
  ${userSchema}

  type Query {
    file(id: ID!): File
    dependency(id: ID!): Dependency
    group(id: ID!): Group
    item(id: ID!): Item
    user(id: ID!): User
  }

  schema {
    query: Query
  }

`];

export default schema;
