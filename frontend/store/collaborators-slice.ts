import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getWorkspaceMembers,
  addWorkspaceMember,
  updateMemberRole,
  removeWorkspaceMember,
  searchUsersInWorkspace,
} from '@/lib/api';
import type { UserSearchResult } from '@/lib/api';

interface Collaborator {
  id: number;
  userId: number;
  role: string;
  joinedAt: string;
  userEmail: string;
}

interface CollaboratorsState {
  members: Collaborator[];
  loading: boolean;
  error: string | null;
  searchResults: UserSearchResult[];
  searchLoading: boolean;
}

const initialState: CollaboratorsState = {
  members: [],
  loading: false,
  error: null,
  searchResults: [],
  searchLoading: false,
};

export const fetchWorkspaceMembers = createAsyncThunk(
  'collaborators/fetchMembers',
  async (workspaceId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const members = await getWorkspaceMembers(workspaceId, token);
      return members;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch members');
    }
  },
);

export const addNewMember = createAsyncThunk(
  'collaborators/addMember',
  async ({ workspaceId, userId, role }: { workspaceId: number; userId: number; role: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const result = await addWorkspaceMember(workspaceId, userId, role, token);
      return result;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to add member');
    }
  },
);

export const updateMemberRoleThunk = createAsyncThunk(
  'collaborators/updateRole',
  async ({ workspaceId, userId, role }: { workspaceId: number; userId: number; role: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const result = await updateMemberRole(workspaceId, userId, role, token);
      return result;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update role');
    }
  },
);

export const removeMemberThunk = createAsyncThunk(
  'collaborators/remove',
  async ({ workspaceId, userId }: { workspaceId: number; userId: number }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      await removeWorkspaceMember(workspaceId, userId, token);
      return userId;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to remove member');
    }
  },
);

export const searchUsersThunk = createAsyncThunk(
  'collaborators/search',
  async ({ workspaceId, email }: { workspaceId: number; email: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const results = await searchUsersInWorkspace(workspaceId, email, token);
      return results;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to search users');
    }
  },
);

const collaboratorsSlice = createSlice({
  name: 'collaborators',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearSearchResults(state) {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaceMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaceMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload.map((member: any) => ({
          id: member.id,
          userId: member.user?.id ?? member.userId,
          role: member.role,
          joinedAt: member.joinedAt,
          userEmail: member.user?.email || '',
        }));
      })
      .addCase(fetchWorkspaceMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addNewMember.fulfilled, (state, action) => {
        state.members.push({
          id: action.payload.id,
          userId: action.payload.userId,
          role: action.payload.role,
          joinedAt: action.payload.joinedAt,
          userEmail: action.payload.user?.email || '',
        });
      })
      .addCase(updateMemberRoleThunk.fulfilled, (state, action) => {
        const index = state.members.findIndex(
          (m) => m.userId === action.payload.userId,
        );
        if (index !== -1) {
          state.members[index].role = action.payload.role;
        }
      })
      .addCase(removeMemberThunk.fulfilled, (state, action) => {
        state.members = state.members.filter(
          (m) => m.userId !== action.payload,
        );
      })
      .addCase(searchUsersThunk.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchUsersThunk.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsersThunk.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSearchResults } = collaboratorsSlice.actions;
export default collaboratorsSlice.reducer;