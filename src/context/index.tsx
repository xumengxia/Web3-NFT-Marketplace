// contexts/index.tsx
import React from 'react';

import { ContractProvider } from './contractContext';

// 组合所有Provider的高阶组件
export function MainProviders({ children }: { children: React.ReactNode }) {
  return (
    <ContractProvider>
      {children}
    </ContractProvider>
  );
}