export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const getInitials = (username: string) => {
  return username.substring(0, 2).toUpperCase();
};

export const getPreviewContent = (content: string) => {
  return content.length > 150 ? content.substring(0, 150) + "..." : content;
};
