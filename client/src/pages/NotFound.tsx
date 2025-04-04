import { Link } from "wouter";

const NotFound = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        fontSize: "2rem",
        fontWeight: "bold",
        color: "#333",
        marginTop: "100px",
      }}
    >
      404 NotFound
      <Link to="/">Return to Home</Link>
    </div>
  );
};
export default NotFound;
