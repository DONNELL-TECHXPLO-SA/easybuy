import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { RootState } from "../store";

export type CartItem = {
  id: number;
  dbItemId?: string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

type InitialState = {
  items: CartItem[];
  syncing: boolean;
};

const initialState: InitialState = {
  items: [],
  syncing: false,
};

export const fetchCartFromDb = createAsyncThunk(
  "cart/fetchFromDb",
  async (_, { rejectWithValue }) => {
    const res = await fetch("/api/cart");
    if (!res.ok) {
      if (res.status === 401) return rejectWithValue("unauthenticated");
      return rejectWithValue("Failed to fetch cart");
    }
    const json = await res.json();
    return json.items as Array<{
      id: string;
      quantity: number;
      product_id: number;
      products: {
        id: number;
        title: string;
        price: number;
        discounted_price: number;
        thumbnail_images: string[];
        preview_images: string[];
      };
    }>;
  }
);

export const addItemToCartDb = createAsyncThunk(
  "cart/addItemToDb",
  async (
    item: Omit<CartItem, "dbItemId">,
    { rejectWithValue }
  ) => {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: item.id, quantity: item.quantity }),
    });
    if (!res.ok) {
      if (res.status === 401) return rejectWithValue("unauthenticated");
      return rejectWithValue("Failed to add item");
    }
    const json = await res.json();
    return { item, dbItemId: json.item.id as string };
  }
);

export const updateCartItemQuantityDb = createAsyncThunk(
  "cart/updateQuantityInDb",
  async (
    payload: { id: number; dbItemId: string; quantity: number },
    { rejectWithValue }
  ) => {
    const res = await fetch(`/api/cart/${payload.dbItemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: payload.quantity }),
    });
    if (!res.ok) {
      if (res.status === 401) return rejectWithValue("unauthenticated");
      return rejectWithValue("Failed to update quantity");
    }
    return payload;
  }
);

export const removeItemFromCartDb = createAsyncThunk(
  "cart/removeItemFromDb",
  async (
    payload: { id: number; dbItemId: string },
    { rejectWithValue }
  ) => {
    const res = await fetch(`/api/cart/${payload.dbItemId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      if (res.status === 401) return rejectWithValue("unauthenticated");
      return rejectWithValue("Failed to remove item");
    }
    return payload.id;
  }
);

export const clearCartDb = createAsyncThunk(
  "cart/clearInDb",
  async (_, { rejectWithValue }) => {
    const res = await fetch("/api/cart", { method: "DELETE" });
    if (!res.ok) {
      if (res.status === 401) return rejectWithValue("unauthenticated");
      return rejectWithValue("Failed to clear cart");
    }
  }
);

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, title, price, quantity, discountedPrice, imgs } =
        action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ id, title, price, quantity, discountedPrice, imgs });
      }
    },
    removeItemFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);
      if (existingItem) {
        existingItem.quantity = quantity;
      }
    },
    removeAllItemsFromCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartFromDb.fulfilled, (state, action) => {
        if (!action.payload || action.meta.requestStatus !== "fulfilled") return;
        state.items = action.payload.map((row) => ({
          id: row.products.id,
          dbItemId: row.id,
          title: row.products.title,
          price: row.products.price,
          discountedPrice: row.products.discounted_price,
          quantity: row.quantity,
          imgs: {
            thumbnails: row.products.thumbnail_images,
            previews: row.products.preview_images,
          },
        }));
      })
      .addCase(addItemToCartDb.pending, (state, action) => {
        const { id, title, price, quantity, discountedPrice, imgs } =
          action.meta.arg;
        const existingItem = state.items.find((item) => item.id === id);
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          state.items.push({ id, title, price, quantity, discountedPrice, imgs });
        }
      })
      .addCase(addItemToCartDb.fulfilled, (state, action) => {
        if (!action.payload) return;
        const { item, dbItemId } = action.payload;
        const existingItem = state.items.find((i) => i.id === item.id);
        if (existingItem) {
          existingItem.dbItemId = dbItemId;
        }
      })
      .addCase(addItemToCartDb.rejected, (state, action) => {
        if (action.payload === "unauthenticated") return;
        const id = action.meta.arg.id;
        const quantity = action.meta.arg.quantity;
        const existingItem = state.items.find((item) => item.id === id);
        if (existingItem) {
          existingItem.quantity -= quantity;
          if (existingItem.quantity <= 0) {
            state.items = state.items.filter((item) => item.id !== id);
          }
        }
      })
      .addCase(updateCartItemQuantityDb.pending, (state, action) => {
        const { id, quantity } = action.meta.arg;
        const existingItem = state.items.find((item) => item.id === id);
        if (existingItem) {
          existingItem.quantity = quantity;
        }
      })
      .addCase(removeItemFromCartDb.pending, (state, action) => {
        state.items = state.items.filter(
          (item) => item.id !== action.meta.arg.id
        );
      })
      .addCase(removeItemFromCartDb.rejected, (state, action) => {
        if (action.payload === "unauthenticated") return;
      })
      .addCase(clearCartDb.pending, (state) => {
        state.items = [];
      })
      .addCase(clearCartDb.rejected, (state, action) => {
        if (action.payload === "unauthenticated") return;
      });
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    return total + item.discountedPrice * item.quantity;
  }, 0);
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
} = cart.actions;

export default cart.reducer;
