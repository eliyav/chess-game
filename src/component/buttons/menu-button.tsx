import React, { MouseEventHandler, useRef } from "react";
const menuUrl = new URL("../../../assets/icons/menu.svg", import.meta.url);

interface Props {
  openNavbar: React.Dispatch<React.SetStateAction<boolean>>;
  isNavbarOpen: boolean;
}

export const MenuButton: React.FC<Props> = ({ isNavbarOpen, openNavbar }) => {
  const ellipseRef = useRef<SVGEllipseElement>(null);
  return (
    <svg
      className="menu-button"
      onClick={() => (isNavbarOpen ? openNavbar(false) : openNavbar(true))}
      width="53"
      height="56"
      viewBox="0 0 53 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => {
        ellipseRef.current &&
          ellipseRef.current.setAttribute("fill", "#FFFFFF");
      }}
      onMouseLeave={() => {
        ellipseRef.current &&
          ellipseRef.current.setAttribute("fill", "#00FFFF");
      }}
    >
      <ellipse
        ref={ellipseRef}
        cx="26.25"
        cy="27.5243"
        rx="26.25"
        ry="27.5243"
        fill="#00FFFF"
      />
      <path
        d="M13.8471 45.8223V37.5147L21.1529 41.0846V49.6413L13.8471 45.8223ZM21.3228 49.634V41.0816L38.4845 31.5754L38.5675 39.6237L21.3228 49.634ZM38.3943 31.4311L21.2354 40.9358L13.9466 37.3742L31.6862 27.6216L38.3943 31.4311Z"
        fill="#D9D9D9"
        stroke="black"
        strokeWidth="0.169903"
      />
      <path
        d="M13.8471 34.7786V26.471L21.1529 30.0409V38.5976L13.8471 34.7786ZM21.3228 38.5903V30.0379L38.4845 20.5317L38.5675 28.58L21.3228 38.5903ZM38.3943 20.3874L21.2354 29.8921L13.9466 26.3305L31.6862 16.5779L38.3943 20.3874Z"
        fill="#D9D9D9"
        stroke="black"
        strokeWidth="0.169903"
      />
      <path
        d="M13.7621 23.65V15.3424L21.068 18.9123V27.469L13.7621 23.65ZM21.2379 27.4617V18.9093L38.3995 9.40306L38.4825 17.4514L21.2379 27.4617ZM38.3094 9.25879L21.1505 18.7635L13.8616 15.2019L31.6013 5.44926L38.3094 9.25879Z"
        fill="#D9D9D9"
        stroke="black"
        strokeWidth="0.169903"
      />
    </svg>
  );
};
