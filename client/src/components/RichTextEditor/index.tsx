import React, { useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ListItemNode, ListNode } from "@lexical/list";
import {
  $getRoot,
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_NORMAL,
  createCommand,
  LexicalEditor,
  LexicalNode,
  $createTextNode,
  EditorState,
} from "lexical";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ErrorBoundary } from "react-error-boundary";
import "./styles.css";

// Define commands for formatting
const FORMAT_TEXT_COMMAND = createCommand("FORMAT_TEXT_COMMAND");

// Error fallback component
const LexicalErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const errorHandler = (error: Error) => {
    console.error("[Lexical Error]", error);
  };

  return (
    <ErrorBoundary
      fallback={<div className="lexical-error">Editor failed to load</div>}
      onError={errorHandler}
    >
      {children}
    </ErrorBoundary>
  );
};

// Toolbar component to apply formatting
const Toolbar = () => {
  const [editor] = useLexicalComposerContext();
  const [activeFormats, setActiveFormats] = useState<{
    bold: boolean;
    italic: boolean;
    underline: boolean;
    ul: boolean;
    ol: boolean;
  }>({
    bold: false,
    italic: false,
    underline: false,
    ul: false,
    ol: false,
  });

  // Update active formats when selection changes
  useEffect(() => {
    const updateActiveFormats = () => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        // Reset formats
        const formats = {
          bold: false,
          italic: false,
          underline: false,
          ul: false,
          ol: false,
        };

        // Check text formats
        if (selection.hasFormat("bold")) formats.bold = true;
        if (selection.hasFormat("italic")) formats.italic = true;
        if (selection.hasFormat("underline")) formats.underline = true;

        // Check for lists
        const nodes = selection.getNodes();
        if (nodes.length > 0) {
          let parent = nodes[0].getParent();
          while (parent !== null) {
            if (parent.getType() === "list") {
              const listType = (parent as ListNode).getListType();
              if (listType === "bullet") formats.ul = true;
              if (listType === "number") formats.ol = true;
              break;
            }
            parent = parent.getParent();
          }
        }

        setActiveFormats(formats);
      });
    };

    // Register for selection changes
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateActiveFormats();
      });
    });
  }, [editor]);

  const formatText = (format: string) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  return (
    <div className="toolbar">
      <button
        className={`toolbar-button ${activeFormats.bold ? "active" : ""}`}
        onClick={() => formatText("bold")}
        title="Bold"
      >
        <span className="toolbar-icon">B</span>
      </button>
      <button
        className={`toolbar-button ${activeFormats.italic ? "active" : ""}`}
        onClick={() => formatText("italic")}
        title="Italic"
      >
        <span className="toolbar-icon">I</span>
      </button>
      <button
        className={`toolbar-button ${activeFormats.underline ? "active" : ""}`}
        onClick={() => formatText("underline")}
        title="Underline"
      >
        <span className="toolbar-icon">U</span>
      </button>
      <div className="toolbar-divider"></div>
      <button
        className={`toolbar-button ${activeFormats.ul ? "active" : ""}`}
        onClick={() => formatText("ul")}
        title="Bullet List"
      >
        <span className="toolbar-icon">• List</span>
      </button>
      <button
        className={`toolbar-button ${activeFormats.ol ? "active" : ""}`}
        onClick={() => formatText("ol")}
        title="Numbered List"
      >
        <span className="toolbar-icon">1. List</span>
      </button>
    </div>
  );
};

// Plugin to handle formatting commands
const FormattingPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      FORMAT_TEXT_COMMAND,
      (format: string) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }

        switch (format) {
          case "bold":
            selection.formatText("bold");
            break;
          case "italic":
            selection.formatText("italic");
            break;
          case "underline":
            selection.formatText("underline");
            break;
          case "ul":
          case "ol": {
            const parent = selection.getNodes()[0].getParent();
            if (parent && parent.getType() === "list") {
              // If already in a list, remove it
              const paragraph = $createParagraphNode();
              parent.replace(paragraph);
            } else {
              // Create a new list
              const listType = format === "ul" ? "bullet" : "number";
              const list = new ListNode(listType);
              const listItem = new ListItemNode();
              list.append(listItem);

              // Move the selected content to list item
              selection.getNodes().forEach((node: LexicalNode) => {
                const content = node.getTextContent();
                node.remove();
                // Create text node in list item instead of using setTextContent
                if (content.trim() !== "") {
                  selection.insertNodes([list]);
                  const para = $createParagraphNode();
                  para.append($createTextNode(content));
                  listItem.append(para);
                }
              });

              // If no content was moved, just insert an empty list
              if (listItem.getChildren().length === 0) {
                const para = $createParagraphNode();
                listItem.append(para);
                selection.insertNodes([list]);
              }
            }
            break;
          }
          default:
            break;
        }

        return true;
      },
      COMMAND_PRIORITY_NORMAL
    );
  }, [editor]);

  return null;
};

// Initial configuration for Lexical editor
const initialConfig = {
  namespace: "RichTextEditor",
  theme: {
    paragraph: "lexical-paragraph",
    text: {
      bold: "lexical-text-bold",
      italic: "lexical-text-italic",
      underline: "lexical-text-underline",
    },
    list: {
      ul: "lexical-ul",
      ol: "lexical-ol",
      listitem: "lexical-li",
    },
  },
  onError: (error: Error) => {
    console.error(error);
  },
  nodes: [ListNode, ListItemNode],
};

// Plugin to initialize the editor with content
function InitialContentPlugin({ initialContent }: { initialContent: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!initialContent) return;

    editor.update(() => {
      const root = $getRoot();

      // Clear the editor
      root.clear();

      // Split content by lines and create paragraphs
      const lines = initialContent.split("\n");
      lines.forEach((line) => {
        const paragraph = $createParagraphNode();
        if (line.trim()) {
          paragraph.append($createTextNode(line));
        }
        root.append(paragraph);
      });
    });
  }, [editor, initialContent]);

  return null;
}

interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
}

// Main RichTextEditor component
export const RichTextEditor = ({
  initialContent = "",
  onChange,
}: RichTextEditorProps) => {
  // Handler for editor changes
  const handleEditorChange = (
    editorState: EditorState,
    editor: LexicalEditor
  ) => {
    editor.update(() => {
      const root = $getRoot();
      const content = root.getTextContent();

      if (onChange) {
        onChange(content);
      }
    });
  };

  return (
    <div className="lexical-editor-container">
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar />
        <div className="lexical-editor">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="lexical-content-editable" />
            }
            placeholder={
              <div className="lexical-placeholder">Start typing...</div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <FormattingPlugin />
          <InitialContentPlugin initialContent={initialContent} />
          {onChange && <OnChangePlugin onChange={handleEditorChange} />}
        </div>
      </LexicalComposer>
    </div>
  );
};

export default RichTextEditor;
