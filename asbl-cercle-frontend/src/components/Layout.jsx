import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  main: {
    padding: "2rem",
  },
};
