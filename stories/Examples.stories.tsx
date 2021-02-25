import React from 'react';
import { Meta } from '@storybook/react';

import Timeline from '../src';
import BasicExample from '../examples/basic';
import InteractiveExample from '../examples/interactive';

const meta: Meta = {
  title: 'Timeline',
  component: Timeline,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Basic = () => <BasicExample />;
Basic.args = {};

export const Interactive = () => <InteractiveExample />;
Interactive.args = {};
