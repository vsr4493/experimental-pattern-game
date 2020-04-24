# Steps to run

Run the following command: 
```npm ci && npm run start```

Note: Configuration can be tweaked in src/PatternGame/gameConfig.js


## Pattern Game

### Stack
Repo was setup using create-react-app
Packages: react, react-dom, emotionJs

### Game Logic

#### Core components: 
- PatternView: Render the pattern -> Accepts a list of patterns and the pattern currently highlighted. Can be controlled when used while game is 'waiting_for_input'.


#### Flow

States: loading, waiting_for_input, level_complete, level_failed, game_complete

- The game will initiate with a state of 'loading', we'll load the current configuration and initialize the state, moving to 'ready'.
- For the current level, we will render the pattern using a stagger based setTimeout. For this we can use a util function which will generate a promise that resolves in a given time. As we move through all promises we can render the current pattern.
- For the current pattern length, for eg: ['R', 'G', 'B', 'Y', 'R', 'G']
- User's actions will be recorded in the current state, and pushed to a level history, with the level recorded separately.
- 

state: {
  level: 1,
  currentSequence: [],
  remainingKeys: currentSequence.length, // Init
}

onSelectKey() {
  // Check if the index at length - remainingKeys is same as the selected key in the current sequence
  // If its not, reset the level
  // If it is and we have reached the last key, show success and move to next level
}

moveToLevel(level) {
  // Show loading state
  // Fetch level data
  // Reset state -> { level, currentSequence: levelData.sequence, remainingKeys: levelData.sequence.length }
  // Set game to ready state
}
