# Common Components

This module provides reusable UI components used across the semantic communication system.

## Components

### Button

The `Button` component provides a standardized button implementation:

- Consistent styling across the application
- Support for multiple variants (primary, secondary, danger, etc.)
- Loading state visualization
- Disabled state handling
- Responsive design with proper padding and alignment

### ModelSettings

The `ModelSettings` component handles configuration of the underlying semantic models:

- API key management for LLM services (OpenAI/Gemini)
- Model type selection (embedding models, sentence transformers)
- Model parameter configuration
- Toggle between local and remote semantic processing
- Provides diagnostic information about model status

### Slider

The `Slider` component offers an interactive control for numeric parameters:

- Customizable range (min/max values)
- Adjustable step size
- Real-time value updates
- Value tooltips and labels
- Support for both linear and logarithmic scales
- Accessible keyboard navigation

### ThemeToggle

The `ThemeToggle` component enables switching between light and dark themes:

- Smooth transition animations
- Remembers user preference using localStorage
- Respects system preference as default
- Uses CSS variables for consistent theme application
- Icon changes to reflect current theme

### ZoomableImageModal

The `ZoomableImageModal` component provides an interactive image viewer:

- Displays images in a modal overlay
- Supports image zooming and panning
- Click outside to close functionality
- Keyboard navigation support (ESC to close)
- Optimized for different image sizes and aspect ratios

## Technical Details

### Theming Implementation

The theme system uses CSS variables defined at the :root level:

```css
:root {
  --background: #ffffff;
  --text-primary: #333333;
  --text-secondary: #666666;
  /* Other variables */
}

[data-theme='dark'] {
  --background: #1a1a1a;
  --text-primary: #f0f0f0;
  --text-secondary: #cccccc;
  /* Other variables */
}
```

### Slider Implementation

The slider component uses the HTML5 `<input type="range">` element with custom styling:

```css
/* Remove default styling */
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
}

/* Custom track and thumb styles */
input[type=range]::-webkit-slider-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: var(--slider-thumb);
  cursor: pointer;
}
```

### Accessibility Features

Common components follow WCAG 2.1 accessibility guidelines:

- All interactive elements have proper ARIA attributes
- Color contrast meets AA standards (4.5:1 for normal text)
- All functionality is keyboard accessible
- Focus states are clearly visible
- Proper semantic HTML elements are used

## Usage

1. Import components from the common directory
2. Use them consistently across the application to maintain UI coherence
3. Configure theme settings through the ThemeToggle component
4. Use ModelSettings for LLM configuration
5. Utilize sliders for all numeric input parameters
