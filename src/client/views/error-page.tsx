import React from "react";

interface ErrorPageProps {
  message: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ message }) => {
  return (
    <div>
      <h1>Error Page</h1>
      <p>{message}</p>
    </div>
  );
};

export default ErrorPage;
