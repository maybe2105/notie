import React from "react";
import { useParams } from "wouter";
import { useNote } from "./useNote";

const Note = () => {
  const { id } = useParams();
  console.log("🚀 ~ Note ~ id:", id);
  const { note, isLoading, error } = useNote(id!);
  console.log("🚀 ~ Note ~ note:", note);
  return <div>{note?.content}</div>;
};

export default Note;
