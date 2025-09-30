# Mat Flip

Mat Flip is a small Angular game that mixes a classic card flip/memory mechanic with simple math challenges. Choose a mode, pick a difficulty, and beat the timer!

- Pairs mode: find all matching pairs.
- Solution mode: solve math problems by flipping the correct answer.
- Multiple difficulties, progress bar timer, and quick restart.

## Tech Stack

- Angular 19 (CLI 19.1.x)
- Angular Material (MDC)
- Signals and @-syntax templates
- TypeScript, SCSS

## Features

- Two game modes (Pairs, Solution)
- Difficulty selection (Easy, Medium, Hard, Mastery)
- Angular Material theme with customizable palettes (see src/styles.scss)
- Dialog summaries on game end
- Responsive layout

## Prerequisites

- Node.js 20+ and npm 10+ (or pnpm 9+)
- Angular CLI 19 (optional global install)

Install or update Angular CLI globally (optional):
```bash
npm i -g @angular/cli@19
```

## Setup

Clone and install dependencies:
```bash
git clone https://github.com/your-username/matflip.git
cd matflip
npm install
```

Start the dev server:
```bash
ng serve
```
Then open http://localhost:4200/

If you don’t have a global CLI:
```bash
npx ng serve
```

## Scripts

- Dev server:
```bash
ng serve
```
- Build:
```bash
ng build
```
- Unit tests (Karma):
```bash
ng test
```
- E2E (if configured):
```bash
ng e2e
```

## Theming and Styling

Primary theming is configured in:
- src/styles.scss (Material palettes and theme)

You can adjust or add palettes (e.g., dark grey or green) and wire them into:
```scss
$portfolio-ui-primary: mat.m2-define-palette($nardo-grey-palette);
$portfolio-ui-accent:  mat.m2-define-palette($lavender-palette);
$portfolio-ui-warn:    mat.m2-define-palette($coral-palette);

$custom-theme: mat.m2-define-light-theme((
  color: (
    primary: $portfolio-ui-primary,
    accent:  $portfolio-ui-accent,
    warn:    $portfolio-ui-warn,
  )
));

@include mat.all-component-themes($custom-theme);
```

Tip: For form-field outline borders, prefer Material tokens/overrides. Example:
```scss
:root {
  @include mat.form-field-overrides((
    outline-color: #888,
    outline-width: 2px
  ));
}
```

## Project Structure (high level)

- src/app/pages/game — main game page/template
- src/app/components/flip-card — card component
- src/app/components/dialogs/game-status — end-of-game dialog
- src/styles.scss — Material theme, palettes, global styles

## Development Notes

- Templates use Angular’s @-syntax (@if, @for, @switch) and Signals.
- Ensure your Angular version is 17+ (this project targets Angular 19).

## Troubleshooting

- Port in use: change port with `ng serve --port 4300`.
- Styles not applying to Material components: verify overrides are in a global stylesheet (styles.scss) or use the provided Material override mixins.
