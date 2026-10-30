"use client";
import { useEffect } from "react";
import { useCart } from "./CartProvider";

/** Empties the cart once Stripe sends the customer back after paying. */
export default function ClearCart() {
  const { clear } = useCart();
  useEffect(() => clear(), [clear]);
  return null;
}
