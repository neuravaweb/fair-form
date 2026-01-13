'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface ImageCarouselProps {
  images: string[]
  interval?: number // Auto-play interval in milliseconds
}

export default function ImageCarousel({ images, interval = 2000 }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoplayTimer, setAutoplayTimer] = useState<NodeJS.Timeout | null>(null)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const resetAutoplay = useCallback(() => {
    if (autoplayTimer) {
      clearInterval(autoplayTimer)
    }
    const timer = setInterval(goToNext, interval)
    setAutoplayTimer(timer)
  }, [goToNext, interval, autoplayTimer])

  useEffect(() => {
    // Start autoplay
    const timer = setInterval(goToNext, interval)
    setAutoplayTimer(timer)

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [goToNext, interval])

  const handleNext = () => {
    goToNext()
    resetAutoplay()
  }

  const handlePrevious = () => {
    goToPrevious()
    resetAutoplay()
  }

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index))
  }

  const handleImageError = (index: number) => {
    console.warn(`Failed to load image at index ${index}: ${images[index]}`)
    // Don't skip, just log the error
  }

  if (images.length === 0) {
    return null
  }

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#010101]">
      <div className="max-w-6xl mx-auto flex justify-center">
        <div className="relative w-full max-w-[600px] h-[450px] sm:max-w-[700px] sm:h-[525px] md:max-w-[800px] md:h-[600px] lg:max-w-[900px] lg:h-[675px] rounded-lg overflow-hidden">
          {/* Images Container */}
          <div className="relative w-full h-full">
            {images.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <Image
                  src={image}
                  alt={`Slide ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageError(index)}
                  unoptimized
                />
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-luxury-gold/80 hover:bg-luxury-gold text-luxury-black w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
                aria-label="Previous image"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-luxury-gold/80 hover:bg-luxury-gold text-luxury-black w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
                aria-label="Next image"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          {/* Dots Indicator (optional) */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index)
                    resetAutoplay()
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex
                      ? 'bg-luxury-gold w-6'
                      : 'bg-luxury-gold/40 hover:bg-luxury-gold/60'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
