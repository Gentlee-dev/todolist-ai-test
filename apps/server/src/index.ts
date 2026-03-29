import express from "express";
import cors from "cors";
import { PORT } from "./constants";
import { errorHandler } from "./middlewares/error-handler";
import { todosRouter } from "./routes/todos";
import { categoriesRouter } from "./routes/categories";
import { tagsRouter } from "./routes/tags";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/todos", todosRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/tags", tagsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app };
