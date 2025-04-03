import styles from "./Misc.module.css";
import { getInitials } from "../note.utils";

const UserAvatar = ({ username }: { username: string }) => (
  <div
    className={styles.userAvatar}
    style={{ backgroundColor: `hsl(${username.charCodeAt(0) * 5}, 70%, 60%)` }}
  >
    {getInitials(username)}
  </div>
);

const UserAvatars = ({ users }: { users: string[] }) => {
  const displayUsers = users.slice(0, 3);
  const remainingCount = users.length - displayUsers.length;

  return (
    <div className={styles.userAvatars}>
      {displayUsers.map((user) => (
        <UserAvatar key={user} username={user} />
      ))}
      {remainingCount > 0 && (
        <div
          className={styles.userAvatar}
          style={{ backgroundColor: "#6c757d" }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};
export default UserAvatars;
