import { httpServer } from "./socket";
const PORT = 3000;

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
