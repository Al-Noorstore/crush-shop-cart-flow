import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductMedia } from "@/types/Product";

interface ImageSliderProps {
  isOpen: boolean;
  onClose: () => void;
  images: ProductMedia[];
  initialIndex?: number;
}

export const ImageSlider = ({ isOpen, onClose, images, initialIndex = 0 }: ImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  if (!images.length) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Product Images</DialogTitle>
        </DialogHeader>
        
        <div className="relative bg-black">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70 w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1}/{images.length}
          </div>

          {/* Main Image */}
          <div className="relative h-[70vh] flex items-center justify-center">
            <img
              src={images[currentIndex]?.url}
              alt={`Product image ${currentIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevImage}
                  className="absolute left-4 bg-black/50 text-white hover:bg-black/70 w-10 h-10 p-0"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextImage}
                  className="absolute right-4 bg-black/50 text-white hover:bg-black/70 w-10 h-10 p-0"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 p-4 bg-black/80 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                    index === currentIndex ? 'border-white' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};