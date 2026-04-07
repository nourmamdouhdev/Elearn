"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";

interface FavoriteButtonProps {
  courseId: string;
  initialFavorite: boolean;
  isLoggedIn: boolean;
}

export function FavoriteButton({ courseId, initialFavorite, isLoggedIn }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (!isLoggedIn) {
      window.location.href = "/auth/login";
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsFavorite(data.isFavorite);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`btn ${isFavorite ? "btn-danger" : "btn-outline"} btn-icon`}
      title={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
      style={{
        transition: "all 0.3s ease",
        transform: isLoading ? "scale(0.9)" : "scale(1)",
      }}
    >
      {isLoading ? (
        <Loader2 size={24} className="animate-spin" />
      ) : (
        <Heart
          size={24}
          fill={isFavorite ? "currentColor" : "none"}
          style={{
            transition: "all 0.3s ease",
            transform: isFavorite ? "scale(1.1)" : "scale(1)",
          }}
        />
      )}
    </button>
  );
}
