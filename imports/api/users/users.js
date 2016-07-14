import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema, attachSchema } from 'meteor/aldeed:collection2';

const Users = Meteor.users;

UserProfile = new SimpleSchema({
  name: {
      type: String,
      label: 'Name',
      optional: true,
  },
  role: {
      type: String,
      label: 'Role',
      optional: true,
      allowedValues: ['client', 'admin'],
  },
  icon: {
      type: String,
      label: 'Icon URL',
      optional: true,
      defaultValue: '/file/dfyWJwvZc6sWvXXsm',
  },
});

Users.schema = new SimpleSchema({
  profile: {
      type: Schemas.UserProfile,
      optional: true,
  },
  emails: {
      type: [Object],
      label: 'Email',
      optional: true,
  },
  "emails.$.address": {
      type: String,
      label: 'Email',
      regEx: SimpleSchema.RegEx.Email,
  },
  "emails.$.verified": {
      type: Boolean,
  },
  createdAt: {
      type: Date,
  },
  services: {
      type: Object,
      optional: true,
      blackbox: true,
  },
  roles: {
      type: Object,
      label: 'Role',
      blackbox: true,
      optional: true,
  },
  parameters: {
      type: Object,
      label: "Parameters",
      blackbox: true,
      optional: true,
  }
});
Users.attachSchema(Users.schema);

export default Users;