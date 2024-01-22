import React from "react";
import { TailSpin } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";

const BlueButton = (props) => {
  const navigate = useNavigate();

  return (
    <button
      disabled={props.loading}
      className="bg-blue-500 text-white rounded-full py-2 px-4 mt-4 hover:bg-blue-600 disabled:opacity-80 inline-flex"
      onClick={() => navigate(props.navigation)}
    >
      {props.loading ? (
        <span className="inline-block px-2">
          <TailSpin width="23" height="23" color="white" />
        </span>
      ) : (
        props.val
      )}
    </button>
  );
};

const ThemeButton = (props) => {
  const navigate = useNavigate();

  return (
    <button
      disabled={props.loading}
      className="bg-gray-800 text-white rounded-xl py-2 px-4 mt-4 hover:bg-gray-900 disabled:opacity-80 inline-flex"
      onClick={() => navigate(props.navigation)}
    >
      {props.loading ? (
        <span className="inline-block px-2">
          <TailSpin width="23" height="23" color="white" />
        </span>
      ) : (
        props.val
      )}
    </button>
  );
};

export { BlueButton, ThemeButton };
