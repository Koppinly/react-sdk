import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import mySdkKey from "./SdkKey";
import {
  createInstance,
  OptimizelyProvider,
  useDecision,
} from "@optimizely/react-sdk";
import "./styles.css";
import "nes.css/css/nes.min.css";

let optimizely = createInstance({
  sdkKey: mySdkKey,
});

function Light({ color, onClick }) {
  let backgroundColor;
  switch (color) {
    case 'red':
      backgroundColor = '#e57373';
      break;
    case 'green':
      backgroundColor = '#92cc41';
      break;
    case 'yellow':
      backgroundColor = '#dada09';
      break;
    default:
      backgroundColor = color;
      break;
  }

  const style = {
    width: "100px",
    height: "100px",
    backgroundColor: backgroundColor,
    borderRadius: "50%",
    margin: "10px auto",
    cursor: "pointer",
    border: "solid 2px #000",
  };

  return <div style={style} onClick={onClick} />;
}

Light.propTypes = {
  color: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

function DecisionComponent({ onReset }) {
  const startTime = performance.now();
  const [decision, setDecision] = useDecision("stoplights");
  const endTime = performance.now();
  const duration = endTime - startTime;
  console.log(`useDecision hook duration: ${duration}ms`);

  const [showEventTriggered, setShowEventTriggered] = useState(false);

  const trackEvent = () => {
    if (decision.enabled) {
      optimizely.track("test_event");
      setShowEventTriggered(true);
      console.log("Tracked test_event");
    }
  };

  let lightColor = 'grey'; // Default color
  if (decision.enabled) {
    switch (decision.variationKey) {
      case "redlight":
        lightColor = "#ff0000";
        break;
      case "greenlight":
        lightColor = "#92cc41";
        break;
      case "yellowlight":
        lightColor = "#dada09";
        break;
      default:
        lightColor = "grey";
        break;
    }
  }

  // Styles for the decision text
  const textStyle = {
    color: lightColor,
    fontSize: "1.5em",
    fontFamily: "monospace",
    textAlign: "center",
    marginTop: "20px",
  };

  return (
    <>
      {decision.enabled && (
        <>
          <Light color={lightColor} onClick={trackEvent} />
          <p style={textStyle}>
            You received the {decision.variationKey} experience.
          </p>
          {showEventTriggered && (
            <p style={textStyle}>
              You did it! You triggered test_event!
            </p>
          )}

          {/* "Try Again" button styled based on the decision */}
          <button
            className="nes-btn"
            style={{
              backgroundColor: lightColor,
              color: "white",
              marginTop: "20px",
              display: "block",
              margin: "0 auto", // Center the button
            }}
            onClick={onReset}
          >
            Try Again
          </button>
        </>
      )}
    </>
  );
}

function App() {
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [key, setKey] = useState(0); // Add key state to force re-rendering

  // Function to reset the entire process
  const resetProcess = () => {
    const newUserId = Math.random().toString(36).substring(2, 15); // Generate new user_id
    optimizely.setUser({
      id: newUserId,
      attributes: {},
    });
    setIsButtonClicked(false); // Reset button click state
    setKey(prevKey => prevKey + 1); // Force re-render with a new key
  };

  useEffect(() => {
    const userId = Math.random().toString(36).substring(2, 15);
    optimizely.setUser({
      id: userId,
      attributes: {},
    });
  }, []);

  return (
    <div className="App" style={{ backgroundColor: "rgb(240, 240, 240)" }}>
      <h1 className="nes-text is-primary">Optimizely Feature</h1>
      <h2 className="nes-text is-warning">Stoplights</h2>
      <button className="nes-btn is-success" onClick={() => setIsButtonClicked(true)}>Click Me</button>
      {isButtonClicked && <DecisionComponent onReset={resetProcess} key={key} />} {/* Pass the reset function */}
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
