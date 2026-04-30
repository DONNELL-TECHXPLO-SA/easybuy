import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

export type WishListItem = {
  id: number;
  dbItemId?: string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  status?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

type InitialState = {
  items: WishListItem[];
};

const initialState: InitialState = {
  items: [],
};

export const fetchWishlistFromDb = createAsyncThunk(
  "wishlist/fetchFromDb",
  async (_, { rejectWithValue }) => {
    const res = await fetch("/api/wishlist");
    if (!res.ok) {
      if (res.status === 401) return rejectWithValue("unauthenticated");
      return rejectWithValue("Failed to fetch wishlist");
    }
    const json = await res.json();
    return json.items as Array<{
      id: string;
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

export const addItemToWishlistDb = createAsyncThunk(
  "wishlist/addItemToDb",
  async (item: Omit<WishListItem, "dbItemId">, { rejectWithValue }) => {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: item.id }),
    });
    if (!res.ok) {
      if (res.status === 401) return rejectWithValue("unauthenticated");
      return rejectWithValue("Failed to add to wishlist");
    }
    const json = await res.json();
    return { item, dbItemId: json.item.id as string };
  }
);

export const removeItemFromWishlistDb = createAsyncThunk(
  "wishlist/removeItemFromDb",
  async (
    payload: { id: number; dbItemId: string },
    { rejectWithValue }
  ) => {
    const res = await fetch(`/api/wishlist/${payload.dbItemId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      if (res.status === 401) return rejectWithValue("unauthenticated");
      return rejectWithValue("Failed to remove from wishlist");
    }
    return payload.id;
  }
);

export const wishlist = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addItemToWishlist: (state, action: PayloadAction<WishListItem>) => {
      const { id, title, price, quantity, imgs, discountedPrice, status } =
        action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ id, title, price, quantity, imgs, discountedPrice, status });
      }
    },
    removeItemFromWishlist: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
    },
    removeAllItemsFromWishlist: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlistFromDb.fulfilled, (state, action) => {
        if (!action.payload) return;
        state.items = action.payload.map((row) => ({
          id: row.products.id,
          dbItemId: row.id,
          title: row.products.title,
          price: row.products.price,
          discountedPrice: row.products.discounted_price,
          quantity: 1,
          imgs: {
            thumbnails: row.products.thumbnail_images,
            previews: row.products.preview_images,
          },
        }));
      })
      .addCase(addItemToWishlistDb.pending, (state, action) => {
        const { id, title, price, quantity, imgs, discountedPrice, status } =
          action.meta.arg;
        const existingItem = state.items.find((item) => item.id === id);
        if (!existingItem) {
          state.items.push({ id, title, price, quantity, imgs, discountedPrice, status });
        }
      })
      .addCase(addItemToWishlistDb.fulfilled, (state, action) => {
        if (!action.payload) return;
        const { item, dbItemId } = action.payload;
        const existingItem = state.items.find((i) => i.id === item.id);
        if (existingItem) {
          existingItem.dbItemId = dbItemId;
        }
      })
      .addCase(addItemToWishlistDb.rejected, (state, action) => {
        if (action.payload === "unauthenticated") return;
        const id = action.meta.arg.id;
        state.items = state.items.filter((item) => item.id !== id);
      })
      .addCase(removeItemFromWishlistDb.pending, (state, action) => {
        state.items = state.items.filter(
          (item) => item.id !== action.meta.arg.id
        );
      })
      .addCase(removeItemFromWishlistDb.rejected, (state, action) => {
        if (action.payload === "unauthenticated") return;
      });
  },
});

export const {
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
} = wishlist.actions;

export default wishlist.reducer;
