import { CompositeDecorator, EditorState, Modifier, RichUtils } from "draft-js";
import { useState } from "react";
import { LinkDecorator } from "../../organisms/TextEditor/Decorators/Link";

export const TEXT_STYLES = {
  BOLD: "BOLD",
  ITALIC: "ITALIC",
};

export type CreateLinkFunction = (props: { text: string; url: string }) => void;

function findLinkEntities(contentBlock: any, callback: any, contentState: any) {
  contentBlock.findEntityRanges((character: any) => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === "LINK"
    );
  }, callback);
}

export function useTextEditor() {
  const [editorState, setEditorState] = useState(
    EditorState.createEmpty(
      new CompositeDecorator([
        {
          strategy: findLinkEntities,
          component: LinkDecorator,
        },
      ])
    )
  );

  const handleKeyCommand = (command: string, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const toggleStyle = (style: string) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const createLink: CreateLinkFunction = ({ text, url }) => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    const contentStateWithCustomText = Modifier.replaceText(
      contentState,
      selectionState,
      text
    );

    const contentStateWithLink = contentStateWithCustomText.createEntity(
      "LINK",
      "MUTABLE",
      {
        url,
      }
    );
    const entityKey = contentStateWithLink.getLastCreatedEntityKey();
    const newSelection = contentStateWithCustomText.getSelectionAfter();

    const contentStateWithLinkApplied = Modifier.applyEntity(
      contentStateWithLink,
      newSelection.merge({
        anchorOffset: newSelection.getStartOffset() - text.length,
        focusOffset: newSelection.getStartOffset(),
      }),
      entityKey
    );
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithLinkApplied,
    });
    setEditorState(newEditorState);
  };

  return {
    editorState,
    setEditorState,
    handleKeyCommand,
    toggleStyle,
    createLink,
  };
}
