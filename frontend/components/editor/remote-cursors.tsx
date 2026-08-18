import { Plugin, PluginKey, EditorState } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { EditorView } from 'prosemirror-view';
import { Extension } from '@tiptap/core';
import type { Node as ProseMirrorNode } from 'prosemirror-model';

export interface RemoteCursor {
  userId: number;
  userName: string;
  userColor: string;
  offset: number;
  docSize: number;
}

interface CursorsPluginState {
  cursors: RemoteCursor[];
  decorations: DecorationSet;
}

const remoteCursorsPluginKey = new PluginKey<CursorsPluginState>('remoteCursors');

function buildDecorations(cursors: RemoteCursor[], doc: ProseMirrorNode): DecorationSet {
  const decorations: Decoration[] = [];
  const docSize = doc.content.size;

  if (docSize === 0) return DecorationSet.empty;

  for (const cursor of cursors) {
    if (cursor.docSize !== docSize) continue;

    const safeOffset = Math.max(1, Math.min(cursor.offset, docSize - 1));

    decorations.push(
      Decoration.widget(
        safeOffset,
        () => {
          const cursorEl = document.createElement('span');
          cursorEl.className = 'remote-cursor';
          cursorEl.setAttribute('data-user-id', String(cursor.userId));
          cursorEl.style.borderLeftColor = cursor.userColor;
          cursorEl.style.position = 'relative';
          cursorEl.style.display = 'inline';
          cursorEl.style.pointerEvents = 'none';

          const label = document.createElement('span');
          label.className = 'remote-cursor-label';
          label.textContent = cursor.userName;
          label.style.background = cursor.userColor;
          cursorEl.appendChild(label);

          return cursorEl;
        },
        { side: -1, inclusive: true },
      ),
    );
  }

  return DecorationSet.create(doc, decorations);
}

export const remoteCursorsPlugin = new Plugin<CursorsPluginState>({
  key: remoteCursorsPluginKey,
  state: {
    init(): CursorsPluginState {
      return { cursors: [], decorations: DecorationSet.empty };
    },
    apply(tr, prev, _oldState, newState) {
      const meta = tr.getMeta(remoteCursorsPluginKey);
      if (meta && meta.cursors) {
        return {
          cursors: meta.cursors,
          decorations: buildDecorations(meta.cursors, newState.doc),
        };
      }
      // Doc changed — rebuild in case docSize now matches
      if (prev.cursors.length > 0 && tr.docChanged) {
        return {
          cursors: prev.cursors,
          decorations: buildDecorations(prev.cursors, newState.doc),
        };
      }
      // Remap existing decorations
      return {
        cursors: prev.cursors,
        decorations: prev.decorations.map(tr.mapping, tr.doc),
      };
    },
  },
  props: {
    decorations(state: EditorState): DecorationSet {
      return remoteCursorsPluginKey.getState(state)?.decorations ?? DecorationSet.empty;
    },
  },
});

export function setRemoteCursors(
  view: EditorView,
  cursors: RemoteCursor[],
) {
  const tr = view.state.tr.setMeta(remoteCursorsPluginKey, { cursors });
  view.dispatch(tr);
}

export function RemoteCursorsExtension() {
  return Extension.create({
    name: 'remoteCursors',
    addProseMirrorPlugins() {
      return [remoteCursorsPlugin];
    },
  });
}
