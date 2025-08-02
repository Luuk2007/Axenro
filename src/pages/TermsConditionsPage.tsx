
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TermsConditionsModal from '@/components/legal/TermsConditionsModal';

const TermsConditionsPage = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      navigate('/');
    }
  };

  // If someone navigates directly to this page, open the modal
  useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <div>
      <TermsConditionsModal open={isOpen} onOpenChange={handleOpenChange} />
    </div>
  );
};

export default TermsConditionsPage;
