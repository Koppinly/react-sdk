// App.js
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from '@mui/material/Button';
import mySdkKey from "./SdkKey";
import {
  createInstance,
  OptimizelyProvider,
  useDecision,
} from "@optimizely/react-sdk";
import "./styles.css";

const optimizely = createInstance({
  sdkKey: mySdkKey, // Replace with your actual SDK key
});

function Light({ color, onClick }) {
  let backgroundColor;
  // Assign a more muted shade based on the color prop
  switch (color) {
    case 'red':
      backgroundColor = '#e57373'; // a muted red
      break;
    case 'green':
      backgroundColor = '#81c784'; // a muted green
      break;
    case 'yellow':
      backgroundColor = '#fff176'; // a muted yellow
      break;
    default:
      backgroundColor = color; // default color or a fallback like grey
      break;
  }

  const style = {
    width: "100px",
    height: "100px",
    backgroundColor: backgroundColor,
    borderRadius: "50%",
    margin: "10px auto",
    cursor: "pointer",
  };

  return <div style={style} onClick={onClick} />;
}

Light.propTypes = {
  color: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

function DecisionComponent() {
  // Start timing before calling the hook
  const startTime = performance.now();

  const [decision, setDecision] = useDecision("stoplights");

  // End timing after the hook returns
  const endTime = performance.now();

  // Calculate the duration
  const duration = endTime - startTime;
  console.log(`useDecision hook duration: ${duration}ms`);

  const [showEventTriggered, setShowEventTriggered] = useState(false);

  useEffect(() => {
    // Set the user here if needed, or move this logic to the App component
  }, []);

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
        break;
    }
  }

  return (
    <>
      {decision.enabled && (
        <>
          <Light color={lightColor} onClick={trackEvent} />
          <p style={{ color: lightColor }}>
            You received the {decision.variationKey} experience.
          </p>
          {showEventTriggered && (
            <p style={{ color: lightColor }}>
              You did it! You triggered test_event!
            </p>
          )}
        </>
      )}
    </>
  );
}

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
      <Button variant="contained" color="success" onClick={() => setIsButtonClicked(true)}>Click Me</Button>
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
