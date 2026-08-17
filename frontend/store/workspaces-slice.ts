import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Workspace, getWorkspaces as apiGetWorkspaces, createWorkspace as apiCreateWorkspace } from "@/lib/api";

interface WorkspacesState {
  workspaces: Workspace[];
  loading: boolean;
}

const initialState: WorkspacesState = {
  workspaces: [],
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
    data: { name: string; description?: string; icon?: string; accentColor?: string };
    token: string;
  }) => {
    return apiCreateWorkspace(data, token);
  },
);

const workspacesSlice = createSlice({
  name: "workspaces",
  initialState,
  reducers: {
    clearWorkspaces(state) {
      state.workspaces = [];
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
      });
  },
});

export const { clearWorkspaces } = workspacesSlice.actions;
export default workspacesSlice.reducer;
