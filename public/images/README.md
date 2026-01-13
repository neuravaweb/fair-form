# Images Folder

This folder contains images for the website.

## Hero Section Background

To add a background image to the hero section:

1. Upload your image to this folder (`public/images/`)
2. Recommended image formats: `.jpg`, `.jpeg`, `.png`, `.webp`
3. Recommended dimensions: 1920x1080 or larger (will be cropped/covered)
4. Update the `backgroundImage` variable in `components/HeroSection.tsx`:
   ```typescript
   const backgroundImage = '/images/your-image-name.jpg'
   ```
5. Uncomment the `<Image>` component in `HeroSection.tsx`

## Image Guidelines

- **File size**: Keep images optimized (< 500KB recommended)
- **Aspect ratio**: 16:9 or similar wide format works best
- **Resolution**: High resolution (1920px+ width) for retina displays
- **Format**: WebP or JPG for photos, PNG for graphics with transparency

## Current Usage

- Hero section background: `/images/hero-background.jpg` (to be uploaded)
