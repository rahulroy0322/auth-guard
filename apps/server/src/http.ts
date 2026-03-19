import { createServer } from "node:http";
import app from "./app";

const http = createServer(app);

export default http;
