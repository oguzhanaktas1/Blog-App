import app from "./app";

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// Burada 0.0.0.0 IP adresini belirtmelisin:
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
