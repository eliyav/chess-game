import React from "react";
import "../../styles/promotion-modal.css";

interface PromotionProps {
  submitSelection: (e: any) => void;
}

const PromotionModal: React.VFC<PromotionProps> = ({ submitSelection }) => {
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
