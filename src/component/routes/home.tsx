import React from "react";
import { MenuButton } from "../buttons/menu-button";

interface HomeScreenProps {
  openNavbar: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Home: React.FC<HomeScreenProps> = ({ openNavbar }) => {
  return (
    <div className="home screen">
      <MenuButton open={openNavbar} />
      <h1 className="page-title">3D Chess</h1>
      <div className="divider"></div>
      <p className="page-info">Play with your friends, no account required!</p>
      <div className="picture">Picture here</div>
      <button>Start Playing!</button>
      <button>Sign Up</button>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Non ut nobis
        excepturi recusandae velit hic, corporis id officia quasi accusantium
        aliquid exercitationem nihil dicta, molestias doloribus dolore in
        voluptates minima! Odit a natus aspernatur dolore tempora ullam.
        Quibusdam ipsum magni eos deleniti, illum fuga expedita temporibus harum
        accusamus ut impedit ullam maxime omnis facilis totam iure numquam?
        Quas, facilis ratione. Sint placeat animi quisquam explicabo expedita,
        unde, incidunt modi, tempora harum a debitis cumque? Ducimus,
        reprehenderit praesentium distinctio expedita aperiam ad voluptatum modi
        omnis neque tempora libero. Nisi, optio quaerat? Veritatis vel odio
        aperiam eius atque dolore voluptatibus quo quia voluptatum ab, suscipit
        id recusandae ducimus voluptate quis a, aliquam quaerat nostrum hic
        harum magni quasi? Cupiditate corrupti beatae dolores? Magni modi
        perferendis quod. Deserunt quisquam facilis sit ea! Doloribus suscipit
        consectetur doloremque facere dolorem? Totam aut possimus sunt
        accusantium, officia illum dolores doloremque cum minus porro
        consequatur necessitatibus voluptatum?
      </p>
    </div>
  );
};
