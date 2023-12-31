import express from "express";
import cors from "cors";
import { route } from "../routes";

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001;

app.use("/api/v1", route);

app.listen(PORT, () => console.log("Server started on PORT: ", PORT));
