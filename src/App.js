import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import mySdkKey from "./SdkKey.js";
import {
  createInstance,
  OptimizelyProvider,
  withOptimizely,
  useDecision,
} from "@optimizely/react-sdk";
import "./styles.css";

const optimizely = createInstance({
  sdkKey: mySdkKey,
});

function Light({ color, onClick }) {
  const style = {
    width: "100px",
    height: "100px",
    backgroundColor: color,
    borderRadius: "50%",
    margin: "10px auto",
    cursor: "pointer", // Change cursor on hover to indicate it's clickable
  };

  return <div style={style} onClick={onClick} />;
}

Light.propTypes = {
  color: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

const DecisionComponent = withOptimizely(({ optimizely }) => {
  const [decision] = useDecision("stoplights");
  const [showEventTriggered, setShowEventTriggered] = useState(false);

  const trackEvent = () => {
    optimizely.track("test_event");
    setShowEventTriggered(true);
  };

  let lightColor;
  switch (decision.variationKey) {
    case "redlight":
      lightColor = "red";
      break;
    case "greenlight":
      lightColor = "green";
      break;
    case "yellowlight":
      lightColor = "yellow";
      break;
    default:
      lightColor = "grey";
  }

  return (
    <>
      <p style={{ color: lightColor }} className="decision__success">
        You received the `{decision.variationKey}` experience.
      </p>
      <Light color={lightColor} onClick={trackEvent} className="light"/>
      {showEventTriggered && (
        <p style={{ color: lightColor }} className="event__success">
          You did it! You triggered test_event!
        </p>
      )}
    </>
  );
});

function App() {
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  useEffect(() => {
    const userId = Math.random().toString(36).substring(2, 15);
    optimizely.setUser({
      id: userId,
      attributes: {},
    });
  }, []);

  return (
    <div className="App">
      <h1>Optimizely Feature</h1>
      <h2>Stoplights</h2>
      <button onClick={() => setIsButtonClicked(true)} className="clickMe__button">Click Me</button>
      {isButtonClicked && <DecisionComponent />}
    </div>
  );
}

function WrappedApp() {
  return (
    <OptimizelyProvider optimizely={optimizely}>
      <App />
    </OptimizelyProvider>
  );
}

export default WrappedApp;
