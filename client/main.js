import '../imports/startup/client';

import React, { Component } from 'react';
import { render } from 'react-dom'
import { renderRoutes } from '../imports/startup/client/routes';

import '../imports/api/api.js';

import { UI_ROOT } from '../imports/api/api';

import './main.css';

Meteor.startup(function() {
  const root = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  document.body.appendChild(root);
  root.setAttribute('id', UI_ROOT);
  root.setAttribute('xmlns', "http://www.w3.org/2000/svg");
  root.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  root.setAttribute('style', 'overflow:visible;');
  root.setAttribute('width', '100%');
  root.setAttribute('height', '100%');
  render(renderRoutes(), root);
});
