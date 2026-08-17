import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  Folder,
  getFolders as apiGetFolders,
  createFolder as apiCreateFolder,
  deleteFolder as apiDeleteFolder,
} from "@/lib/api";

interface FoldersState {
  folders: Folder[];
  loading: boolean;
}

const initialState: FoldersState = {
  folders: [],
  loading: false,
};

export const fetchFolders = createAsyncThunk(
  "folders/fetchAll",
  async ({
    workspaceId,
    token,
  }: {
    workspaceId: number;
    token: string;
  }) => {
    return apiGetFolders(workspaceId, token);
  },
);

export const createNewFolder = createAsyncThunk(
  "folders/create",
  async ({
    workspaceId,
    data,
    token,
  }: {
    workspaceId: number;
    data: { name: string; icon?: string };
    token: string;
  }) => {
    return apiCreateFolder(workspaceId, data, token);
  },
);

export const deleteFolderById = createAsyncThunk(
  "folders/delete",
  async ({
    workspaceId,
    folderId,
    token,
  }: {
    workspaceId: number;
    folderId: number;
    token: string;
  }) => {
    await apiDeleteFolder(workspaceId, folderId, token);
    return folderId;
  },
);

const foldersSlice = createSlice({
  name: "folders",
  initialState,
  reducers: {
    clearFolders(state) {
      state.folders = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFolders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.folders = action.payload;
        state.loading = false;
      })
      .addCase(fetchFolders.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createNewFolder.fulfilled, (state, action) => {
        state.folders.unshift(action.payload);
      })
      .addCase(deleteFolderById.fulfilled, (state, action) => {
        state.folders = state.folders.filter(
          (f) => f.id !== action.payload,
        );
      });
  },
});

export const { clearFolders } = foldersSlice.actions;
export default foldersSlice.reducer;
