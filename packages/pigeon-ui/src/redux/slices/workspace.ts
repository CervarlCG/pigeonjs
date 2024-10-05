import { createSlice } from "@reduxjs/toolkit";
import { Channel, Message, Workspace } from "pigeon-types/entities";

const initialState: {
  workspaces: Workspace[];
  workspace: Workspace | null;
  channels: Channel[];
  messages: Record<number, Message[]>;
} = {
  workspaces: [],
  workspace: null,
  channels: [],
  messages: {},
};

export const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    initialize(state, action) {
      state.workspaces = action.payload.workspaces;
      (state.workspace = action.payload.workspaces[0]),
        (state.channels = action.payload.channels);
      state.messages = {};

      action.payload.messages.forEach((message: Message) => {
        if (Array.isArray(state.messages[message.channel.id]))
          state.messages[message.channel.id] = [
            ...state.messages[message.channel.id],
            { ...message },
          ];
        else {
          state.messages[message.channel.id] = [{ ...message }];
        }
      });
    },
    switchWorkspace(state, action) {
      state.workspace =
        state.workspaces.find((workspace) => workspace.id === action.payload) ||
        null;
    },
  },
});

export const { initialize, switchWorkspace } = workspaceSlice.actions;

export default workspaceSlice.reducer;
