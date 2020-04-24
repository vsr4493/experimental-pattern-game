import React from "react";
// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { levelConfig } from "./gameConfig";
console.log(levelConfig);

// Utilities
const keyMirror = (...args) => args.reduce((r, i) => ((r[i] = i), r), {});
const waitFor = (time) => new Promise((resolve) => setTimeout(resolve, time));

// Time in ms
const HIGHLIGHT_TIME = 300;
const STAGE_TRANSITION_TIME = 1500;

const messagesByStage = {
  ready: "Whenever you're ready, click start!",
  showing_pattern: "Showing patterns! Pay attention!",
  waiting_for_input: "Please enter the pattern",
  level_complete: "The level is complete! Moving to the next level!",
  level_failed: "Uh oh, this is the wrong sequence. Off we go to level 1",
  game_complete: "The game is complete, You've won!",
};

const stages = keyMirror(
  "ready",
  "showing_pattern",
  "waiting_for_input",
  "level_complete",
  "level_failed",
  "loading",
  "game_complete"
);

const noOp = () => {};
const PatternView = ({
  disabled,
  colorCodes,
  highlightedCode,
  size = 250,
  onClick,
}) => {
  const sectionSize = 360 / colorCodes.length;
  console.log(highlightedCode);
  return (
    <div
      css={css`
        border-radius: 50%;
        height: ${size}px;
        width: ${size}px;
        background-color: #fff;
        overflow: hidden;
        position: relative;
        border: 1px solid #f1f1f1;
        opacity: ${disabled ? 0.2 : 1};
      `}
    >
      {colorCodes.map((code, index) => (
        <div
          key={index}
          onClick={onClick ? () => onClick(code, index) : null}
          css={css`
            transform: rotate(${75 + index * sectionSize}deg);
            background-color: ${code};
            width: 500px;
            height: 500px;
            position: absolute;
            transform-origin: 100% 100%;
            left: 50%;
            top: 50%;
            border: 1px solid #fff;
            margin-top: -500px;
            margin-left: -500px;
            opacity: ${highlightedCode === code ? 1 : 0.2};
            &:active,
            &:focus {
              opacity: 1;
            }
          `}
        />
      ))}
    </div>
  );
};

const Container = ({ children }) => {
  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        min-height: 100vh;
        background-color: #282c34;
        & > div {
          margin: 16px 0px;
        }
      `}
    >
      {children}
    </div>
  );
};

const Message = ({ text }) => {
  const [isVisible, setVisibility] = React.useState(null);
  return (
    <p
      css={css`
        color: #fff;
        font-size: 16px;
        font-weight: 600;
      `}
    >
      {text}
    </p>
  );
};

const Button = (props) => (
  <button
    css={css`
      position: relative;
      appearance: none;
      overflow: hidden;
      outline: 0px;
      &:hover,
      &:active,
      &:focus {
        outline: 0px;
      }
      border-width: 1px;
      border-style: solid;
      padding: 8px 24px;
      border-radius: 4px;
      background-color: #fff;
      color: #000;
      border-color: #f1f1f1;
      font-size: 24px;
    `}
    {...props}
  ></button>
);

const getDefaultState = () => ({
  level: 1,
  currentSequence: null,
  remainingKeys: null,
});

const Game = ({}) => {
  const [stage, setStage] = React.useState(stages.loading);
  const [state, setState] = React.useState(getDefaultState);
  const [highlightedCode, setHighLightedCode] = React.useState(null);

  const moveToLevel = React.useCallback(
    async (level = 1) => {
      // TODO: Show loading state
      const currentSequence = levelConfig.patternsByLevel[level];
      setState({
        level,
        currentSequence,
        cursor: 0,
      });
      // Move to ready state
      setStage(stages.ready);
    },
    [state, stage]
  );

  const onUserAction = React.useCallback(
    async (code) => {
      // Check if the color at current index is same
      const { currentSequence, cursor, level } = state;
      console.log(currentSequence, cursor, level, code);
      if (currentSequence[cursor] !== code) {
        setStage(stages.level_failed);
        await waitFor(STAGE_TRANSITION_TIME);
        // Reset the level
        await moveToLevel(1);
        return;
      }

      const nextCursor = cursor + 1;

      // We're fine, lets move on
      // Reduce the cursor by one, and if the next < 0, then we set to level complete and move to level 2
      // Alternatively, can also be done with a useEffect on the cursor state (This would need us to allow -1 as part of the invariant)
      const isLevelComplete = nextCursor >= currentSequence.length;
      // Level is 1 indexed
      const isLastLevel = level === levelConfig.levelCount;

      // If the game is over
      if (isLastLevel && isLevelComplete) {
        return setStage(stages.game_complete);
      }

      // Move to next level
      if (isLevelComplete) {
        setStage(stages.level_complete);
        await waitFor(STAGE_TRANSITION_TIME);
        await moveToLevel(level + 1);
        return;
      }

      //Reduce sequence by 1
      setState({ ...state, cursor: nextCursor });
    },
    [state, stage]
  );

  React.useEffect(() => {
    moveToLevel(1);
  }, []);
  React.useEffect(() => {
    // We must use an IIFE here as react use-effect hook functions cannot be async
    (async () => {
      const { currentSequence } = state;
      if (stage === stages.showing_pattern) {
        // Move to visual state (as we highlight codes)
        for (let i = 0; i < state.currentSequence.length; i++) {
          setHighLightedCode(currentSequence[i]);
          await waitFor(HIGHLIGHT_TIME);
          setHighLightedCode(null);
          await waitFor(HIGHLIGHT_TIME);
        }
        setHighLightedCode(null);
        setStage(stages.waiting_for_input);
      }
    })();
  }, [stage]);

  return (
    <Container>
      <h2
        css={css`
          color: #fff;
        `}
      >
        Current Level: {state.level}
      </h2>
      <Message text={messagesByStage[stage]} />
      <PatternView
        disabled={
          stage !== stages.waiting_for_input && stage !== stages.showing_pattern
        }
        highlightedCode={highlightedCode}
        colorCodes={levelConfig.colorCodes}
        onClick={stage === stages.waiting_for_input ? onUserAction : null}
      />
      <div
        css={css`
          padding: 24px;
          display: flex;
          align-items: center;
          justifycontent: center;
        `}
      >
        {stage !== stages.game_complete &&
          <Button
            disabled={stage !== stages.ready}
            onClick={
              stage === stages.ready
                ? () => setStage(stages.showing_pattern)
                : null
            }
          >
            Start!
          </Button>
        }
        {stage === stages.game_complete &&
          <Button onClick={() => moveToLevel(1)}>
            Restart!
          </Button>
        }
      </div>
    </Container>
  );
};

export default Game;
