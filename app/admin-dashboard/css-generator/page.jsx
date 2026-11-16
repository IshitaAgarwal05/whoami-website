'use client';

import React, { useState } from 'react';
import AdminHeader from '../../../components/Admin/AdminHeader';
import ThemeEditor from './ThemeEditor';
import ThemePreview from './ThemePreview';
import CssCodeModal from '../../../components/Admin/CssCodeModal';

export default function CssGeneratorPage() {
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <AdminHeader
        title="CSS Generator & Theme Studio"
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
      />

      <div className="theme-studio">
        {/* Left: Token Controls */}
        <ThemeEditor />

        {/* Right: Live Interactive Sandbox */}
        <ThemePreview />
      </div>

      {/* Code Modal */}
      <CssCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </div>
  );
}
