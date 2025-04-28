import React from 'react';
import { Redirect } from 'expo-router';

export default function IndexPage() {
  // Use Redirect component instead of useEffect for navigation
  return <Redirect href="/game" />;
}
