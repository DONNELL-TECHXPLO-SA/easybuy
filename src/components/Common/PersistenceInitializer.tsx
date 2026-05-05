"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@/app/context/AuthContext";
import {
  fetchCartFromDb,
  hydrateCart,
  selectCartItems,
} from "@/redux/features/cart-slice";
import {
  fetchWishlistFromDb,
  hydrateWishlist,
} from "@/redux/features/wishlist-slice";
import { AppDispatch, RootState } from "@/redux/store";

export default function PersistenceInitializer() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading: authLoading } = useAuth();
  
  const cartItems = useSelector(selectCartItems);
  const wishlistItems = useSelector((state: RootState) => state.wishlistReducer.items);
  
  const isInitialMount = useRef(true);
  const prevUserRef = useRef<string | null>(null);

  // Handle initial hydration and auth changes
  useEffect(() => {
    if (authLoading) return;

    const currentUserId = user?.id || null;
    prevUserRef.current = currentUserId;

    if (user) {
      // User is logged in, fetch from DB
      dispatch(fetchCartFromDb());
      dispatch(fetchWishlistFromDb());
    } else {
      // User is guest, load from localStorage
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            dispatch(hydrateCart(parsedCart));
          }
        } catch (e) {
          console.error("Failed to parse cart from localStorage", e);
        }
      }

      const savedWishlist = localStorage.getItem("wishlist");
      if (savedWishlist) {
        try {
          const parsedWishlist = JSON.parse(savedWishlist);
          if (Array.isArray(parsedWishlist)) {
            dispatch(hydrateWishlist(parsedWishlist));
          }
        } catch (e) {
          console.error("Failed to parse wishlist from localStorage", e);
        }
      }
    }
  }, [user, authLoading, dispatch]);

  // Handle saving to localStorage for guest users
  useEffect(() => {
    if (authLoading || isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!user) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
      localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
    }
  }, [cartItems, wishlistItems, user, authLoading]);

  return null;
}
