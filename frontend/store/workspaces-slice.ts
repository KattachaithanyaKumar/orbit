import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  Workspace,
  getWorkspaces as apiGetWorkspaces,
  createWorkspace as apiCreateWorkspace,
  deleteWorkspace as apiDeleteWorkspace,
} from "@/lib/api";

interface WorkspacesState {
  workspaces: Workspace[];
  activeWorkspaceId: number | null;
  loading: boolean;
}

function getStoredActiveWorkspaceId(): number | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("activeWorkspaceId");
  return stored ? Number(stored) : null;
}

const initialState: WorkspacesState = {
  workspaces: [],
  activeWorkspaceId: getStoredActiveWorkspaceId(),
  loading: false,
};

export const fetchWorkspaces = createAsyncThunk(
  "workspaces/fetchAll",
  async (token: string) => {
    return apiGetWorkspaces(token);
  },
);

export const createNewWorkspace = createAsyncThunk(
  "workspaces/create",
  async ({
    data,
    token,
  }: {
    data: {
      name: string;
      description?: string;
      icon?: string;
      accentColor?: string;
    };
    token: string;
  }) => {
    return apiCreateWorkspace(data, token);
  },
);

export const deleteWorkspaceById = createAsyncThunk(
  "workspaces/delete",
  async ({ id, token }: { id: number; token: string }) => {
    await apiDeleteWorkspace(id, token);
    return id;
  },
);

const workspacesSlice = createSlice({
  name: "workspaces",
  initialState,
  reducers: {
    clearWorkspaces(state) {
      state.workspaces = [];
      state.activeWorkspaceId = null;
      localStorage.removeItem("activeWorkspaceId");
    },
    setActiveWorkspace(state, action: { payload: number | null }) {
      state.activeWorkspaceId = action.payload;
      if (action.payload !== null) {
        localStorage.setItem("activeWorkspaceId", String(action.payload));
      } else {
        localStorage.removeItem("activeWorkspaceId");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.workspaces = action.payload;
        state.loading = false;
      })
      .addCase(fetchWorkspaces.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createNewWorkspace.fulfilled, (state, action) => {
        state.workspaces.unshift(action.payload);
      })
      .addCase(deleteWorkspaceById.fulfilled, (state, action) => {
        state.workspaces = state.workspaces.filter(
          (ws) => ws.id !== action.payload,
        );
        if (state.activeWorkspaceId === action.payload) {
          state.activeWorkspaceId = null;
          localStorage.removeItem("activeWorkspaceId");
        }
      });
  },
});

export const { clearWorkspaces, setActiveWorkspace } = workspacesSlice.actions;
export default workspacesSlice.reducer;
