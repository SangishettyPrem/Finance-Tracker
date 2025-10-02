import express from "express";
import helmet from "helmet";
import { connectGraphQL } from "@/GraphQL/graphql.config.js";
import cors, { CorsOptions } from "cors";
import { errorMiddleware } from "@/middlewares/error.js";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "@/lib/db.js";
import authRouter from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import { ConnectRedis } from "./lib/redisConnect.js";

dotenv.config({ path: "./.env" });

export const envMode = process.env.NODE_ENV?.trim() || "DEVELOPMENT";
const port = process.env.PORT || 3000;

const mongoURI = process.env.MONGO_URI! || "mongodb://localhost:27017";
const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false, // disable CORP block
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const whiteListedIp = [
  "http://localhost:5000",
  "https://financetrackerprem.netlify.app",
];
const corsOptions: CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    console.log("origin: ", origin);
    if (origin && whiteListedIp.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Cookie",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.send("App Working Fine.");
});

app.use("/api/auth/v1", authRouter);
await connectGraphQL(app)
  .then(() => {
    console.log("Graphql Connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Page not found",
  });
});

app.use(errorMiddleware);

app.listen(port, async () => {
  connectDB(mongoURI)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err: Error) => {
      console.error("Failed to Connect MongoDB: ", err?.message);
    });
  await ConnectRedis();
  console.log(
    "Server is working on Port:" + port + " in " + envMode + " Mode."
  );
});
