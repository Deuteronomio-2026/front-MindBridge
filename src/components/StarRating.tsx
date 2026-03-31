import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: number;
  showNumber?: boolean;
  reviewCount?: number;
}

export function StarRating({ rating, size = 14, showNumber = true, reviewCount }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => {
        const filled = rating >= star;
        const partial = !filled && rating > star - 1;
        return (
          <div key={star} className="relative" style={{ width: size, height: size }}>
            <Star
              size={size}
              className="text-gray-200 fill-gray-200"
            />
            {(filled || partial) && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: partial ? `${(rating - Math.floor(rating)) * 100}%` : "100%" }}
              >
                <Star size={size} className="text-amber-400 fill-amber-400" />
              </div>
            )}
          </div>
        );
      })}
      {showNumber && (
        <span className="text-sm text-slate-700 ml-1" style={{ fontWeight: 600 }}>
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-sm text-slate-400">({reviewCount})</span>
      )}
    </div>
  );
}
