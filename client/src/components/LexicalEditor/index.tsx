import { $getRoot, $createParagraphNode, $createTextNode } from "lexical";
import { useEffect } from "react";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { EditorState } from "lexical";

import "./styles.css";

const theme = {
  paragraph: "lexical-paragraph",
  text: {
    base: "lexical-text",
    underline: "lexical-underline",
    strikethrough: "lexical-strikethrough",
    subscript: "lexical-subscript",
    superscript: "lexical-superscript",
  },
};

function MyCustomAutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.focus();
  }, [editor]);

  return null;
}

function InitialContentPlugin({ initialContent }: { initialContent: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (initialContent) {
      editor.update(() => {
        const root = $getRoot();
        if (root.getFirstChild() === null) {
          const paragraphs = initialContent.split("\n\n");

          for (const paragraph of paragraphs) {
            const paragraphNode = $createParagraphNode();
            const lines = paragraph.split("\n");

            for (let i = 0; i < lines.length; i++) {
              const textNode = $createTextNode(lines[i]);
              paragraphNode.append(textNode);
            }

            root.append(paragraphNode);
          }
        }
      });
    }
  }, [editor, initialContent]);

  return null;
}

function onError(error: Error) {
  console.error(error);
}

interface LexicalEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
}

export default function LexicalEditor({
  initialContent = "",
  onChange,
  readOnly = false,
}: LexicalEditorProps) {
  const initialConfig = {
    namespace: "NotieEditor",
    theme,
    onError,
    editable: !readOnly,
  };

  function handleChange(editorState: EditorState) {
    editorState.read(() => {
      const root = $getRoot();
      const text = root.getTextContent();
      if (onChange) onChange(text);
    });
  }

  return (
    <div className="lexical-editor-container">
      <LexicalComposer initialConfig={initialConfig}>
        <PlainTextPlugin
          contentEditable={<ContentEditable className="lexical-editor" />}
          placeholder={
            <div className="lexical-placeholder">Enter some text...</div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <InitialContentPlugin initialContent={initialContent} />
        <OnChangePlugin onChange={handleChange} />
        <HistoryPlugin />
        {!readOnly && <MyCustomAutoFocusPlugin />}
      </LexicalComposer>
    </div>
  );
}
