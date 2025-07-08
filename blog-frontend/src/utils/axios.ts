import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000", // backend'in portu
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
