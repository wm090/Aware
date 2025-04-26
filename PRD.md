# Technical Blueprint: Aware - Focus & Awareness Game

This document outlines the technical blueprint for the "Aware" mobile game application, designed to enhance user focus and awareness through simple, engaging gameplay.

## 1. Product Design Requirements (PDR)

*   **Project Vision:** To create a minimalist mobile game that helps users improve their concentration, awareness, and reaction time in a calming yet challenging way, serving as a tool for stress reduction and mental focus.
*   **Target Users:** Individuals seeking simple, accessible tools for mindfulness, stress relief, focus improvement, or a quick mental challenge. Suitable for all ages comfortable with basic mobile game interactions.
*   **Core Features:**
    *   Player-controlled circle avatar.
    *   Finger gesture-based movement controls.
    *   Randomized arrow attacks targeting the player.
    *   Collision detection between arrows and the player.
    *   Real-time survival timer.
    *   Game over state upon collision.
    *   Restart game functionality.
*   **Functional Requirements:**
    *   The application must render a clean white background with a black player circle positioned centrally by default.
    *   Users must be able to move the circle freely on the screen using touch gestures.
    *   Arrows must spawn from random positions along the screen edges.
    *   Arrows must travel towards the player's current position at varying, randomized speeds.
    *   The game must accurately detect collisions between any arrow and the player circle.
    *   A timer must continuously track and display the duration of the current game session in a clear format (e.g., MM:SS.ms).
    *   Upon collision, the game must immediately transition to a "Game Over" state, freezing gameplay and displaying the final survival time.
    *   The "Game Over" state must present an option to restart the game.
    *   Restarting the game must reset the timer, player position, and clear existing arrows.
*   **Non-Functional Requirements:**
    *   **Performance:** Smooth animations and responsive controls (60 FPS target). Low latency between gesture input and circle movement. Efficient collision detection.
    *   **Usability:** Intuitive controls, minimalist UI, clear visual feedback.
    *   **Reliability:** Stable gameplay with no crashes during normal use. Consistent behavior across supported devices.
    *   **Maintainability:** Well-structured, documented, and testable code.
*   **Problem Solved:** Provides a simple, non-intrusive, and engaging way for users to practice mindfulness and focus by requiring constant awareness and quick reactions in a controlled, minimalist environment. It offers a gamified approach to mental training.

## 2. Tech Stack

*   **Frontend Framework:** React Native
    *   *Why:* Enables cross-platform development (iOS and Android) from a single codebase, leveraging existing web development skills. Large community and ecosystem.
*   **Language:** TypeScript
    *   *Why:* Adds static typing to JavaScript, improving code quality, maintainability, and developer productivity by catching errors early. Essential for larger or complex projects.
*   **Development Environment:** Expo
    *   *Why:* Simplifies React Native development with managed workflows, easy setup, over-the-air updates, and access to native device features via the Expo SDK. Reduces native configuration overhead.
*   **Navigation:** Expo Router
    *   *Why:* File-based routing for React Native apps built with Expo, offering a streamlined and intuitive way to handle navigation between screens (e.g., Game Screen, Game Over Screen).
*   **UI Framework:** React Native Paper
    *   *Why:* Provides a set of high-quality, customizable, Material Design-compliant UI components, accelerating UI development and ensuring a consistent look and feel. Useful for buttons, dialogs (Game Over), and potentially text elements.
*   **State Management:** React Hooks (`useState`, `useReducer`) initially. Consider Zustand or Jotai if complexity increases.
    *   *Why:* Built-in React state management is sufficient for simple scenarios. Zustand/Jotai offer lightweight global state solutions if needed later (e.g., for settings or themes).
*   **Animation:** React Native Animated API or `react-native-reanimated`.
    *   *Why:* Essential for smooth movement of the player circle and arrows. `react-native-reanimated` offers better performance for complex animations by running them on the native UI thread.
*   **Gesture Handling:** `react-native-gesture-handler`.
    *   *Why:* Provides more robust and performant gesture handling compared to the built-in React Native system, crucial for responsive player control. Often integrated with `react-native-reanimated`.
*   **Security Considerations:**
    *   As the initial version is client-side only, the primary concern is securing any potential future API keys or sensitive configuration. Use `expo-constants` or environment variables, and ensure `.env` files are in `.gitignore` (**Security Checklist #3, #4**).
    *   If a backend is added later, all relevant security checklist items (auth, endpoint protection, etc.) must be implemented.

## 3. App Flowchart (Conceptual)

```mermaid
graph TD
    A[App Launch] --> B{Game Screen};
    B --> C{Initialize Game State (Timer=0, Player @ Center)};
    C --> D[Render UI (Player, Timer)];
    D --> E{Game Loop Active};
    E -- User Gesture --> F[Update Player Position];
    E -- Timer Tick --> G[Increment Timer];
    E -- Spawn Logic --> H[Generate Arrow (Random Angle/Speed)];
    H --> I[Move Arrow Towards Player];
    I --> J{Collision Check};
    J -- No Collision --> E;
    F --> J; // Player movement also requires collision check
    J -- Collision Detected --> K[Game Over];
    K --> L[Display Final Score & Restart Option];
    L -- Restart Tapped --> B;
    L -- Exit/Close App --> M[End];

    subgraph Game Logic
        F
        G
        H
        I
        J
    end
```

## 4. Project Rules

*   **Version Control:** Git with GitHub/GitLab/Bitbucket.
    *   **Branching Strategy:** Gitflow (main, develop, feature/`, bugfix/`, release/`) or a simpler GitHub Flow (main, feature/`). Feature branches must be used for all new development.
    *   **Commit Messages:** Conventional Commits standard (e.g., `feat: add player movement`, `fix: correct collision detection`).
*   **Code Style & Linting:**
    *   ESLint with recommended TypeScript rules (`@typescript-eslint/recommended`) and React Native specific plugins (`eslint-plugin-react-native`).
    *   Prettier for automatic code formatting. Configure to run on save and as a pre-commit hook.
*   **Testing:**
    *   Unit/Integration Tests: Jest with React Native Testing Library. Aim for high coverage of core game logic (collision detection, state transitions, timer) and UI components.
    *   End-to-End (E2E) Tests: Consider Detox or Maestro for automated UI testing on simulators/devices if complexity warrants it.
    *   Manual Testing: Required on target devices (iOS/Android simulators and physical devices) before releases.
*   **Documentation:**
    *   TSDoc for documenting functions, classes, and types within the code.
    *   README.md: Maintain project setup, build, and run instructions.
    *   PRD.md (this file): Keep updated with any significant changes to requirements or architecture.
*   **Code Reviews:**
    *   All code must be reviewed via Pull Requests (PRs) before merging into `develop` or `main`.
    *   Reviewers should check for correctness, adherence to standards, performance, and potential bugs.
*   **Performance:** Profile regularly using Flipper or React DevTools. Optimize critical paths like rendering, gesture handling, and game loop logic.
*   **Accessibility:** Follow React Native accessibility guidelines (e.g., proper `accessibilityLabel`, sufficient contrast - though the design is high-contrast). Ensure touch targets are adequately sized.

## 5. Implementation Plan

*   **Phase 1: Project Setup & Basic Structure (Est. 1-2 days)**
    *   Initialize Expo project with TypeScript template: `npx create-expo-app Aware --template tabs-typescript` (or blank).
    *   Install necessary dependencies: `react-native-paper`, `react-native-gesture-handler`, `react-native-reanimated`.
    *   Set up ESLint, Prettier, and TypeScript configuration.
    *   Configure Expo Router for basic navigation (if needed, e.g., between Game and GameOver).
    *   Set up Git repository and initial commit.
*   **Phase 2: Game Screen UI & Player Rendering (Est. 2-3 days)**
    *   Create the main `GameScreen` component.
    *   Render the white background and the black player circle using React Native `<View>` components or potentially SVG (`react-native-svg`).
    *   Implement the Timer display using `react-native-paper`'s `Text` component.
    *   Style components using `StyleSheet.create`.
*   **Phase 3: Player Movement (Est. 2-3 days)**
    *   Integrate `react-native-gesture-handler` (e.g., `PanGestureHandler`).
    *   Implement logic to update the player circle's position based on finger gestures.
    *   Ensure movement is smooth and constrained within screen bounds.
    *   Use `react-native-reanimated` for performant animation updates if needed.
*   **Phase 4: Arrow Mechanics (Est. 3-5 days)**
    *   Develop logic for spawning arrows:
        *   Random edge selection.
        *   Random initial speed.
        *   Targeting the player's current position at the time of spawn.
    *   Implement arrow movement logic (update position each frame towards the target).
    *   Implement basic collision detection (e.g., distance check between arrow center and player center).
    *   Manage an array of active arrows in the game state.
    *   Remove arrows that go off-screen.
*   **Phase 5: Game State & Timer Logic (Est. 2-3 days)**
    *   Implement game state management (e.g., `idle`, `playing`, `gameOver`) using `useState` or `useReducer`.
    *   Implement the timer logic: start, stop, reset. Update the display every frame or at a set interval.
    *   Trigger the `gameOver` state upon collision detection.
*   **Phase 6: Game Over Screen & Restart (Est. 1-2 days)**
    *   Create a `GameOverScreen` component or overlay.
    *   Display the final survival time.
    *   Add a "Restart" button using `react-native-paper`.
    *   Implement the restart logic: reset game state, timer, player position, clear arrows, navigate back to `GameScreen`.
*   **Phase 7: Polishing & Testing (Est. 3-4 days)**
    *   Refine animations and visual feedback.
    *   Write unit/integration tests for core logic (collision, timer, state).
    *   Perform thorough manual testing on different devices/simulators.
    *   Address bugs and performance issues.
*   **Phase 8: Build & Deployment Prep (Est. 1 day)**
    *   Configure build settings in `app.json` (icons, splash screen, versioning).
    *   Create development and production builds using EAS Build (Expo Application Services) or standard Expo Go testing.

*   **Dependencies:** Phases depend sequentially on previous ones (e.g., Arrow Mechanics depends on Player Rendering).

## 6. Project File Structure

```
aware/
├── app/                           # Expo Router directory
│   ├── _layout.tsx                # Root layout component
│   ├── index.tsx                  # Main entry point (redirects to game)
│   ├── game.tsx                   # Game screen
│   └── assets/                    # Static assets
│       ├── fonts/                 # Custom fonts if needed
│       └── images/                # Images if needed
├── src/
│   ├── components/                # Reusable UI components
│   │   ├── game/                  # Game-specific components
│   │   │   ├── PlayerCircle.tsx   # Player circle component
│   │   │   ├── Arrow.tsx          # Arrow component
│   │   │   ├── TimerDisplay.tsx   # Timer display component
│   │   │   └── GameOverOverlay.tsx # Game over overlay component
│   │   └── ui/                    # Generic UI components
│   │       └── Button.tsx         # Custom button component
│   ├── hooks/                     # Custom React hooks
│   │   ├── useGameState.ts        # Game state management hook
│   │   ├── usePlayerMovement.ts   # Player movement hook with gesture handling
│   │   ├── useArrowSpawner.ts     # Arrow spawning logic hook
│   │   ├── useCollisionDetection.ts # Collision detection hook
│   │   └── useGameTimer.ts        # Timer management hook
│   ├── utils/                     # Utility functions
│   │   ├── collision.ts           # Collision detection utilities
│   │   ├── random.ts              # Random number generation utilities
│   │   └── animation.ts           # Animation utilities
│   ├── types/                     # TypeScript type definitions
│   │   ├── game.ts                # Game-related types
│   │   └── index.ts               # Type exports
│   ├── constants/                 # App constants
│   │   ├── game.ts                # Game constants (speeds, sizes, etc.)
│   │   ├── colors.ts              # Color constants
│   │   └── index.ts               # Constants exports
│   └── context/                   # React Context if needed
│       └── GameContext.tsx        # Game context for state sharing
├── __tests__/                     # Test files
│   ├── components/                # Component tests
│   ├── hooks/                     # Hook tests
│   └── utils/                     # Utility function tests
├── .eslintrc.js                   # ESLint configuration
├── .prettierrc.js                 # Prettier configuration
├── app.json                       # Expo configuration
├── babel.config.js                # Babel configuration
├── jest.config.js                 # Jest configuration
├── package.json                   # Project dependencies
├── tsconfig.json                  # TypeScript configuration
├── PRD.md                         # Product Requirements Document
└── README.md                      # Project documentation
```

### Key Design Decisions:

1. **Expo Router Structure**: Using the file-based routing of Expo Router with a simple structure since the game has minimal navigation needs.

2. **Component Organization**:
   - Separating game-specific components from generic UI components
   - Each component in its own file for better maintainability

3. **Custom Hooks**:
   - Breaking down game logic into specialized hooks
   - This promotes reusability and separation of concerns
   - Makes testing easier by isolating specific functionality

4. **TypeScript Integration**:
   - Dedicated types directory for shared type definitions
   - Enhances code quality and developer experience

5. **Constants**:
   - Centralizing game parameters for easy tuning and configuration
   - Improves maintainability by avoiding magic numbers in the code

6. **Testing Structure**:
   - Mirrors the source directory structure for easy correlation
   - Supports Jest with React Native Testing Library

This structure optimizes for clear separation of concerns, maintainability, testability, developer experience, and performance (by encouraging proper component splitting and memoization).

## 7. Frontend Guidelines (React Native)

*   **Design Principles:**
    *   **Minimalism:** Keep the UI clean and uncluttered, focusing on the core gameplay elements.
    *   **Responsiveness:** Use Flexbox for layout. Test on various screen sizes and aspect ratios. Ensure UI elements adapt correctly.
    *   **Performance:** Prioritize smooth frame rates (60 FPS). Optimize animations and state updates. Profile frequently.
    *   **Accessibility:** Use high contrast (black on white is good). Ensure touch targets (player control area) are sufficiently large. Add `accessibilityLabel` where appropriate.
*   **Component Architecture:**
    *   **Functional Components & Hooks:** Use functional components and React Hooks exclusively.
    *   **Modularity:** Break down the UI into smaller, reusable components (e.g., `PlayerCircle`, `Arrow`, `TimerDisplay`, `GameOverOverlay`).
    *   **Separation of Concerns:** Separate game logic (state updates, collision detection, physics) from UI rendering where possible (e.g., using custom hooks).
    *   **State Management:** Start with `useState`/`useReducer` for local component state. Elevate state or use Context API/Zustand only when necessary for shared state between distant components.
*   **Styling:**
    *   Use React Native's `StyleSheet.create` for performance benefits.
    *   Leverage React Native Paper's theming capabilities for consistent styling if using multiple Paper components.
    *   Avoid inline styles where possible, especially complex objects, to prevent unnecessary re-renders.
*   **Performance Practices:**
    *   **Memoization:** Use `React.memo` for components that re-render often with the same props. Use `useCallback` for functions passed down as props, especially event handlers. Use `useMemo` for expensive calculations. (See Section 8).
    *   **Animation:** Use `react-native-reanimated` and `react-native-gesture-handler` for performant animations and gestures running on the native thread.
    *   **Game Loop:** Optimize the game loop logic (arrow updates, collision checks) to be as efficient as possible. Avoid heavy computations within the loop.
    *   **Profiling:** Use Flipper or React DevTools Profiler to identify performance bottlenecks.

## 8. Backend Guidelines

*   **Initial Version:** The core gameplay described does **not** require a backend. All logic (game state, physics, scoring) resides entirely on the client-side within the React Native application.
*   **Future Considerations:** If features like online leaderboards, user accounts, achievements, or analytics are added, a backend will be necessary.
    *   **Tech Stack (Example):** Node.js (with Express or NestJS), PostgreSQL/MongoDB database, or a Backend-as-a-Service (BaaS) like Firebase or Supabase.
    *   **API Design:** RESTful API or GraphQL for communication between the app and the server.
    *   **Data Storage:** Choose appropriate database based on data structure (SQL for relational data like users/scores, NoSQL might fit simpler scenarios).
    *   **Security:** Implement robust authentication (**Security Checklist #1, #2, #6, #7**), authorization, input validation, rate limiting, and secure database practices (**#8**). Ensure HTTPS is enforced (**#10**). Use environment variables for secrets (**#3**). Sanitize error messages (**#5**).
    *   **Scalability:** Design the backend with scalability in mind if high user load is anticipated (e.g., using serverless functions, load balancing). Choose a secure hosting platform (**#9**).

## 9. Optimised React Code Guidelines (React Native)

*   **Avoid Unnecessary Re-renders:** This is critical for game performance.
    *   **Problem:** Inline functions or objects passed as props cause child components to re-render even if the data hasn't changed.
      ```typescript
      // Problematic: Inline function/object
      const GameScreen = () => {
        const [position, setPosition] = useState({ x: 0, y: 0 });
        const handleMove = (newPos) => setPosition(newPos); // New function instance each render

        return <PlayerCircle position={position} onMove={handleMove} style={{ backgroundColor: 'black' }} />; // New style object each render
      };
      ```
    *   **Solution:** Use `useCallback` for functions and `useMemo` or define objects/styles outside the component or with `StyleSheet.create`.
      ```typescript
      // Optimized
      const styles = StyleSheet.create({
        playerStyle: { backgroundColor: 'black' },
      });

      const GameScreen = () => {
        const [position, setPosition] = useState({ x: 0, y: 0 });

        const handleMove = useCallback((newPos) => { // Memoized function
          setPosition(newPos);
        }, []); // Empty dependency array means function is created once

        const playerStyle = useMemo(() => ({ // Memoized object (if dynamic)
             // ... dynamic styles based on state if needed
        }), [/* dependencies */]);


        return <PlayerCircle position={position} onMove={handleMove} style={styles.playerStyle} />; // Stable props
      };

      // PlayerCircle.tsx
      const PlayerCircle = React.memo(({ position, onMove, style }) => { // Memoize component
        // ... rendering logic ...
      });
      ```
*   **Memoize Components:** Wrap components in `React.memo` if they receive props that don't change often, preventing re-renders when parent state unrelated to them changes. Especially useful for static elements or components like individual `Arrow` instances if their props (e.g., initial trajectory) don't change after creation.
*   **Memoize Expensive Calculations:** Use `useMemo` to cache the results of computationally intensive functions so they don't run on every render.
    ```typescript
    const expensiveCalculation = (data) => { /* ... heavy computation ... */ return result; };

    const MyComponent = ({ data }) => {
      const memoizedResult = useMemo(() => expensiveCalculation(data), [data]);
      // Use memoizedResult in render
    };
    ```
*   **Efficient List Rendering:** While not heavily list-based, if managing many arrows, ensure rendering is efficient. Avoid anonymous functions in `map` calls if passing them down to components. Use `key` props correctly. `FlatList` is generally preferred for long lists but might be overkill here unless arrow count becomes very large.
*   **State Structure:** Keep state updates minimal. Avoid deeply nested state objects if only parts change frequently, as it can make memoization harder. Consider splitting state if appropriate.
*   **Use `react-native-reanimated`:** For animations and gesture-driven updates, prefer `reanimated` as it can run logic off the JavaScript thread, leading to smoother experiences, especially during heavy JS processing.

## 10. Security Checklist Integration

This section summarizes how the security checklist applies, particularly noting the client-side nature of the initial version.

1.  **Use a battle-tested auth library:** N/A for initial version. **Required** if user accounts/backend are added. Use Expo Auth Session, Firebase Auth, Clerk, Auth0 etc.
2.  **Lock down protected endpoints:** N/A for initial version. **Required** if a backend API is added. Check identity on every request.
3.  **Never expose secrets on the frontend:** **Applicable.** Any future API keys or sensitive config must use environment variables (e.g., via `expo-constants` and `.env` files). Do not hardcode secrets.
4.  **Git-ignore sensitive files:** **Applicable.** Ensure `.env` and any similar files (e.g., `google-services.json`, `.p12` keys) are added to `.gitignore` immediately.
5.  **Sanitise error messages:** **Good Practice.** While client-side, avoid overly technical error popups. If backend added, return generic errors, log details server-side.
6.  **Use middleware auth checks:** N/A for initial version. **Required** for backend routes if added.
7.  **Add role-based access control (RBAC):** N/A for initial version. **Required** if backend with different user roles is added.
8.  **Use secure DB libraries or platforms:** N/A for initial version. **Required** if backend with database is added. Use ORMs (like Prisma, TypeORM) or BaaS with security rules (Firebase, Supabase). Avoid raw SQL where possible.
9.  **Host on a secure platform:** **Applicable** for backend/web deployment. Use reputable providers (Vercel, Netlify, AWS, GCP, Azure) with built-in security features. For mobile, app stores provide distribution security.
10. **Enable HTTPS everywhere:** **Applicable** if any external API calls are made or a backend is added. Ensure all network requests use HTTPS.
11. **Limit file-upload risks:** N/A. No file uploads planned. **Required** if this feature is ever added.
