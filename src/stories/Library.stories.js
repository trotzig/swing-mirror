import '../../public/styles.css';

import React from 'react';

import { Library } from '../Library';

const config = {
  component: Library,
};

export default config;

export const Default = () => <Library />;
export const Edit = () => <Library edit />;
