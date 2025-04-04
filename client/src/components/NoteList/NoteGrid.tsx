import React from "react";
import { Note } from "../../types/Note";
import styles from "./NoteList.module.css";
import { FixedSizeGrid as Grid, GridChildComponentProps } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import NoteCard from "./NoteCard";
import LoadingCard from "./LoadingCard";

interface NoteGridProps {
  notes: Note[];
  dimensions: { width: number; height: number };
  columnCount: number;
  hasMore: boolean;
  isLoading: boolean;
  loadMoreNotes: () => Promise<void>;
  openDeleteDialog: (e: React.MouseEvent, note: Note) => void;
}

interface GridRenderedInfo {
  visibleRowStartIndex: number;
  visibleRowStopIndex: number;
  visibleColumnStartIndex: number;
  visibleColumnStopIndex: number;
}

const NoteGrid: React.FC<NoteGridProps> = ({
  notes,
  dimensions,
  columnCount,
  hasMore,
  isLoading,
  loadMoreNotes,
  openDeleteDialog,
}) => {
  // Items loaded status for InfiniteLoader
  const itemCount = hasMore ? notes.length + 1 : notes.length;
  const isItemLoaded = (index: number) => !hasMore || index < notes.length;
  const loadMoreItems = isLoading ? () => Promise.resolve() : loadMoreNotes;

  // Calculate item dimensions
  const itemWidth = dimensions.width / columnCount;
  const itemHeight = 320; // Height to prevent stacking
  const rowCount = Math.ceil(itemCount / columnCount);

  const Cell = ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
    const index = rowIndex * columnCount + columnIndex;

    if (!isItemLoaded(index)) {
      return <LoadingCard style={style} />;
    }

    if (index >= notes.length) {
      return <div style={style}></div>;
    }

    const note = notes[index];
    return (
      <NoteCard note={note} openDeleteDialog={openDeleteDialog} style={style} />
    );
  };

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={loadMoreItems}
    >
      {({ onItemsRendered, ref }) => {
        // Convert from list to grid
        const onGridItemsRendered = ({
          visibleRowStartIndex,
          visibleRowStopIndex,
          visibleColumnStartIndex,
          visibleColumnStopIndex,
        }: GridRenderedInfo) => {
          const startIndex =
            visibleRowStartIndex * columnCount + visibleColumnStartIndex;
          const stopIndex =
            visibleRowStopIndex * columnCount + visibleColumnStopIndex;
          onItemsRendered({
            overscanStartIndex: startIndex,
            overscanStopIndex: stopIndex,
            visibleStartIndex: startIndex,
            visibleStopIndex: stopIndex,
          });
        };

        return (
          <Grid
            ref={ref}
            columnCount={columnCount}
            columnWidth={itemWidth}
            height={Math.min(dimensions.height, window.innerHeight - 150)}
            rowCount={rowCount}
            rowHeight={itemHeight}
            width={dimensions.width}
            onItemsRendered={onGridItemsRendered}
            className={styles.virtualGrid}
          >
            {Cell}
          </Grid>
        );
      }}
    </InfiniteLoader>
  );
};

export default NoteGrid;
