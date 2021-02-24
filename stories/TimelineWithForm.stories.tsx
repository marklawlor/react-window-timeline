import React from 'react';
import { Meta, Story } from '@storybook/react';

import Timeline from '../src';
import Interactive from '../src/examples/interactive';

const meta: Meta = {
  title: 'Interactive',
  component: Timeline,
};

export default meta;

const Template: Story = () => {
  return <Interactive />;
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing

export const Default = Template.bind({});
Default.args = {};
