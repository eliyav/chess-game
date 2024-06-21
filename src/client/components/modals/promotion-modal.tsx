import React from "react";

interface PromotionProps {
  submitSelection: (e: any) => void;
}

const PromotionModal: React.FC<PromotionProps> = ({ submitSelection }) => {
  return (
    <div className="promotion-wrapper" onClick={submitSelection}>
      <div className="selection red">Rook</div>
      <div className="selection blue">Bishop</div>
      <div className="selection green">Knight</div>
      <div className="selection yellow">Queen</div>
    </div>
  );
};

export default PromotionModal;
