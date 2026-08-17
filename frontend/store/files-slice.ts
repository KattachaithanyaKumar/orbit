import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  FileItem,
  getFiles as apiGetFiles,
  createFile as apiCreateFile,
  getFile as apiGetFile,
  updateFile as apiUpdateFile,
  deleteFile as apiDeleteFile,
} from "@/lib/api";

interface FilesState {
  filesByFolder: Record<number, FileItem[]>;
  activeFile: FileItem | null;
  activeFolderId: number | null;
  loading: boolean;
}

const initialState: FilesState = {
  filesByFolder: {},
  activeFile: null,
  activeFolderId: null,
  loading: false,
};

export const fetchFiles = createAsyncThunk(
  "files/fetchAll",
  async ({
    workspaceId,
    folderId,
    token,
  }: {
    workspaceId: number;
    folderId: number;
    token: string;
  }) => {
    const files = await apiGetFiles(workspaceId, folderId, token);
    return { folderId, files };
  },
);

export const createNewFile = createAsyncThunk(
  "files/create",
  async ({
    workspaceId,
    folderId,
    data,
    token,
  }: {
    workspaceId: number;
    folderId: number;
    data: { name: string };
    token: string;
  }) => {
    const file = await apiCreateFile(workspaceId, folderId, data, token);
    return { folderId, file };
  },
);

export const fetchFile = createAsyncThunk(
  "files/fetchOne",
  async ({
    workspaceId,
    folderId,
    fileId,
    token,
  }: {
    workspaceId: number;
    folderId: number;
    fileId: number;
    token: string;
  }) => {
    return apiGetFile(workspaceId, folderId, fileId, token);
  },
);

export const updateFileContent = createAsyncThunk(
  "files/update",
  async ({
    workspaceId,
    folderId,
    fileId,
    data,
    token,
  }: {
    workspaceId: number;
    folderId: number;
    fileId: number;
    data: { name?: string; content?: unknown };
    token: string;
  }) => {
    return apiUpdateFile(workspaceId, folderId, fileId, data, token);
  },
);

export const deleteFileById = createAsyncThunk(
  "files/delete",
  async ({
    workspaceId,
    folderId,
    fileId,
    token,
  }: {
    workspaceId: number;
    folderId: number;
    fileId: number;
    token: string;
  }) => {
    await apiDeleteFile(workspaceId, folderId, fileId, token);
    return { folderId, fileId };
  },
);

const filesSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    clearFiles(state) {
      state.filesByFolder = {};
      state.activeFile = null;
      state.activeFolderId = null;
    },
    setActiveFile(state, action) {
      state.activeFile = action.payload;
    },
    setActiveFolderId(state, action) {
      state.activeFolderId = action.payload;
    },
    clearActiveFile(state) {
      state.activeFile = null;
      state.activeFolderId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.filesByFolder[action.payload.folderId] = action.payload.files;
      })
      .addCase(createNewFile.fulfilled, (state, action) => {
        const { folderId, file } = action.payload;
        if (!state.filesByFolder[folderId]) {
          state.filesByFolder[folderId] = [];
        }
        state.filesByFolder[folderId].unshift(file);
      })
      .addCase(fetchFile.fulfilled, (state, action) => {
        state.activeFile = action.payload;
      })
      .addCase(updateFileContent.fulfilled, (state, action) => {
        state.activeFile = action.payload;
        for (const folderId of Object.keys(state.filesByFolder)) {
          const files = state.filesByFolder[Number(folderId)];
          const idx = files.findIndex((f) => f.id === action.payload.id);
          if (idx !== -1) {
            files[idx] = action.payload;
            break;
          }
        }
      })
      .addCase(deleteFileById.fulfilled, (state, action) => {
        const { folderId, fileId } = action.payload;
        const files = state.filesByFolder[folderId];
        if (files) {
          state.filesByFolder[folderId] = files.filter(
            (f) => f.id !== fileId,
          );
        }
        if (state.activeFile?.id === fileId) {
          state.activeFile = null;
        }
      });
  },
});

export const { clearFiles, setActiveFile, setActiveFolderId, clearActiveFile } =
  filesSlice.actions;
export default filesSlice.reducer;
