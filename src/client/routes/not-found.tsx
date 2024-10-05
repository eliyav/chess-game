import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div
      className={"content"}
      style={{ textAlign: "center", marginTop: "50px" }}
    >
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <br></br>
      <Link to="/">
        <span style={{ fontSize: "1.5em" }}>Go to Home</span>
      </Link>
    </div>
  );
};

export default NotFound;
