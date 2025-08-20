# Design System - Group Payment App

This design system provides consistent colors, typography, and components for the group payment app using NativeWind (Tailwind CSS for React Native).

## Brand Colors

### Primary Colors
- **Primary**: `#68763D` - Main brand color (olive green)
- **Secondary**: `#8C4843` - Secondary brand color (reddish brown)
- **Body Text**: `#001303` - Main text color (dark green)
- **Background**: `#FFFCFC` - App background (off-white)

### Accent Colors
- **Dark Accent**: `#5D429E` - For special actions (purple)
- **Light Accent**: `#99A451` - For highlights (lighter green)

## Typography

### Font Families
- **Fraunces**: Used for headings and display text
- **Commissioner**: Used for body text and UI elements

### Usage in Components
```tsx
// Headings (Fraunces)
<Text className="font-heading text-2xl font-bold">Heading Text</Text>

// Body text (Commissioner)
<Text className="font-body text-base">Body text content</Text>
```

## Components

### Button Component

Available variants and usage:

```tsx
import Button from '@/components/ui/Button';

// Primary button (olive green)
<Button title="Primary Action" onPress={handlePress} variant="primary" />

// Secondary button (reddish brown)
<Button title="Secondary Action" onPress={handlePress} variant="secondary" />

// Dark accent button (purple)
<Button title="Special Action" onPress={handlePress} variant="darkAccent" />

// Light accent button (light green)
<Button title="Highlight Action" onPress={handlePress} variant="lightAccent" />

// Outline button
<Button title="Outline" onPress={handlePress} variant="outline" />

// Ghost button
<Button title="Ghost" onPress={handlePress} variant="ghost" />

// With loading state
<Button title="Loading..." onPress={handlePress} loading={true} />

// Different sizes
<Button title="Small" onPress={handlePress} size="sm" />
<Button title="Medium" onPress={handlePress} size="md" />
<Button title="Large" onPress={handlePress} size="lg" />
<Button title="Extra Large" onPress={handlePress} size="xl" />

// Full width
<Button title="Full Width" onPress={handlePress} fullWidth />
```

### Card Component

Available variants and usage:

```tsx
import Card from '@/components/ui/Card';

// Default card
<Card>
  <Text>Card content</Text>
</Card>

// Primary themed card
<Card variant="primary">
  <Text>Primary card content</Text>
</Card>

// Secondary themed card
<Card variant="secondary">
  <Text>Secondary card content</Text>
</Card>

// Elevated card with shadow
<Card variant="elevated">
  <Text>Elevated card content</Text>
</Card>

// Outlined card
<Card variant="outlined">
  <Text>Outlined card content</Text>
</Card>

// Different padding options
<Card padding="sm">Small padding</Card>
<Card padding="md">Medium padding</Card>
<Card padding="lg">Large padding</Card>
<Card padding="xl">Extra large padding</Card>
<Card padding="none">No padding</Card>
```

## Color Classes (NativeWind)

### Brand Colors
```tsx
// Primary color scale
className="bg-primary-50"    // Lightest
className="bg-primary-500"   // Main primary color
className="bg-primary-900"   // Darkest

// Secondary color scale
className="bg-secondary-50"   // Lightest
className="bg-secondary-500"  // Main secondary color
className="bg-secondary-900"  // Darkest

// Accent colors
className="bg-darkAccent-800"   // Dark accent
className="bg-lightAccent-400"  // Light accent

// Text colors
className="text-bodyText"       // Main text color
className="text-primary-500"    // Primary text
className="text-secondary-500"  // Secondary text
```

### Background
```tsx
className="bg-background"  // Main app background
```

## Typography Classes

### Font Families
```tsx
className="font-heading"  // Fraunces font
className="font-body"     // Commissioner font
className="font-display"  // Fraunces font (alias)
```

### Text Sizes
```tsx
className="text-xs"    // 12px
className="text-sm"    // 14px
className="text-base"  // 16px
className="text-lg"    // 18px
className="text-xl"    // 20px
className="text-2xl"   // 24px
className="text-3xl"   // 30px
className="text-4xl"   // 36px
```

### Font Weights
```tsx
className="font-normal"    // 400
className="font-medium"    // 500
className="font-semibold"  // 600
className="font-bold"      // 700
```

## Common Patterns

### Payment Card Example
```tsx
<Card variant="primary" padding="lg">
  <Text className="font-heading text-xl font-bold text-primary-700 mb-2">
    Split Bill: $127.50
  </Text>
  <Text className="font-body text-base text-primary-600 mb-4">
    4 people • $31.88 each
  </Text>
  <Button 
    title="Approve Payment" 
    onPress={handleApprove} 
    variant="primary" 
    fullWidth 
  />
</Card>
```

### Action Button Row
```tsx
<View className="flex-row gap-3">
  <Button 
    title="Join Group" 
    onPress={handleJoin} 
    variant="lightAccent" 
    className="flex-1"
  />
  <Button 
    title="Create Group" 
    onPress={handleCreate} 
    variant="darkAccent" 
    className="flex-1"
  />
</View>
```

## Setup Instructions

### 1. Installing Dependencies
The following dependencies are already included:
- `nativewind`: Tailwind CSS for React Native
- `tailwindcss`: Peer dependency

### 2. Configuration Files
- `tailwind.config.js`: Tailwind configuration with custom colors and fonts
- `styles/global.css`: NativeWind imports
- `constants/Colors.ts`: Color constants and themes
- `constants/Typography.ts`: Font and text style constants
- `constants/Layout.ts`: Spacing and layout constants

### 3. Adding Custom Fonts
To add the Fraunces and Commissioner fonts:

1. Download the font files and add them to `assets/fonts/`
2. Update `app/_layout.tsx` to load the fonts:
```tsx
const [loaded] = useFonts({
  Fraunces: require('../assets/fonts/Fraunces-Regular.ttf'),
  'Fraunces-Bold': require('../assets/fonts/Fraunces-Bold.ttf'),
  Commissioner: require('../assets/fonts/Commissioner-Regular.ttf'),
  'Commissioner-Medium': require('../assets/fonts/Commissioner-Medium.ttf'),
  'Commissioner-Bold': require('../assets/fonts/Commissioner-Bold.ttf'),
});
```

## Demo Component

To see all design system elements in action, import and use the `DesignSystemDemo` component:

```tsx
import DesignSystemDemo from '@/components/ui/DesignSystemDemo';

export default function DemoScreen() {
  return <DesignSystemDemo />;
}
```

This component showcases all colors, typography, buttons, and cards with example usage for the payment app.

## Contributing

When adding new components:
1. Use the established color palette
2. Use Fraunces for headings, Commissioner for body text
3. Follow the existing pattern of using NativeWind classes
4. Add new components to the design system demo
5. Update this README with usage examples 