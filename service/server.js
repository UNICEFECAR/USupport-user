import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import passport from "passport";

import v1 from "#routes/index";
import middleware from "#middlewares/index";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

/*------------- Security Config -------------*/

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(passport.initialize());

/*------------- User Service Endpoints -------------*/

// Example router
app.use("/user/v1/user", v1.UserRouter);
app.use("/user/v1/auth", v1.AuthRouter);

/*------------- Error middleware -------------*/

app.use(middleware.errorMiddleware.notFound);
app.use(middleware.errorMiddleware.errorHandler);

app.listen(PORT, () => {
  console.log(`User Server listening on port ${PORT}`);
});
