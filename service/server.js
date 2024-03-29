import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import passport from "passport";

import v1 from "#routes/index";
import middleware from "#middlewares/index";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

/* ------------- Security Config ------------- */

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(passport.initialize());

/* ------------- User Service Endpoints ------------- */

app.use("/user/v1/user", v1.UserRouter);
app.use("/user/v1/auth", v1.AuthRouter);
app.use("/user/v1/rescue", v1.RescueRouter);
app.use("/user/v1/upload-file", v1.UploadFileRouter);
app.use("/user/v1/languages", v1.LanguageRouter);
app.use("/user/v1/countries", v1.CountryRouter);
app.use("/user/v1/work-with", v1.WorkWithRouter);

/* ------------- Error middleware ------------- */

app.use(middleware.errorMiddleware.notFound);
app.use(middleware.errorMiddleware.errorHandler);

app.listen(PORT, () => {
  console.log(`User Server listening on port ${PORT}`);
});
