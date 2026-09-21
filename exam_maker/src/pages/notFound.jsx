import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.errorCode}>404</h1>
        <h2 style={styles.title}>Oops! Page Not Found</h2>
        <p style={styles.text}>
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <button onClick={() => navigate("/login")} style={styles.button}>
          Go to Login
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f7f6",
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  content: {
    textAlign: "center",
    padding: "40px",
    borderRadius: "20px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    maxWidth: "500px",
    width: "90%",
  },
  errorCode: {
    fontSize: "120px",
    margin: "0",
    color: "#ff4757",
    fontWeight: "900",
    letterSpacing: "-5px",
    lineHeight: "1",
  },
  title: {
    fontSize: "28px",
    color: "#2f3542",
    margin: "20px 0 10px",
  },
  text: {
    color: "#747d8c",
    fontSize: "16px",
    lineHeight: "1.6",
    marginBottom: "30px",
  },
  button: {
    padding: "12px 30px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "#2f3542",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    transition: "transform 0.2s, background-color 0.2s",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },
};
