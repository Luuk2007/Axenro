
import React from 'react';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
}
