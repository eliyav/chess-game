import React from "react";
import "./promotion-modal.css";

interface PromotionProps {
  submitSelection: (e: any) => string;
}

const PromotionModal: React.VFC<PromotionProps> = ({ submitSelection }) => {
  return (
    <div className="promotion-wrapper" onClick={submitSelection}>
      <div className="selection">Rook</div>
      <div className="selection">Bishop</div>
      <div className="selection">Knight</div>
      <div className="selection">Queen</div>
    </div>
  );
};

export default PromotionModal;
