import React from "react";
import NoteList from "../../components/NoteList";
import { Note } from "../../types/Note";

const Home = () => {
  const mockNotes: Note[] = [
    {
      id: "1",
      username: "user",
      content:
        "Meeting notes from today:\n\n- Discussed new project timeline\n- Set up weekly check-ins\n- Assigned tasks to team members\n- Reviewed Q2 goals\n- Next steps: Follow up with stakeholders",
      createdAt: "2024-04-01T10:00:00Z",
      updatedAt: "2024-04-01T10:00:00Z",
    },
    {
      id: "2",
      username: "user",
      content:
        "Ideas for weekend project:\n\n1. Build a garden planter box\n2. Paint the living room\n3. Organize garage\n4. Start learning Spanish\n5. Try new recipe for dinner",
      createdAt: "2024-03-31T15:30:00Z",
      updatedAt: "2024-03-31T16:45:00Z",
    },
    {
      id: "3",
      username: "user",
      content:
        'Book recommendations:\n\n📚 "The Psychology of Money" by Morgan Housel\n📚 "Atomic Habits" by James Clear\n📚 "Deep Work" by Cal Newport\n\nNeed to start with Atomic Habits first!',
      createdAt: "2024-03-30T08:20:00Z",
      updatedAt: "2024-03-30T08:20:00Z",
    },
    {
      id: "4",
      username: "user",
      content:
        "Shopping list:\n\n🛒 Groceries\n- Eggs\n- Milk\n- Bread\n- Fresh vegetables\n- Chicken breast\n\n🏠 Home supplies\n- Paper towels\n- Dish soap\n- Laundry detergent",
      createdAt: "2024-03-29T14:15:00Z",
      updatedAt: "2024-03-29T14:15:00Z",
    },
    {
      id: "5",
      username: "user",
      content:
        "Random thoughts:\n\nLife is like a box of chocolates - you never know what you're gonna get. But that's what makes it interesting! Every day is a new adventure waiting to happen.",
      createdAt: "2024-03-28T20:45:00Z",
      updatedAt: "2024-03-28T20:45:00Z",
    },
  ];

  return (
    <div>
      <NoteList notes={mockNotes} />
    </div>
  );
};

export default Home;
