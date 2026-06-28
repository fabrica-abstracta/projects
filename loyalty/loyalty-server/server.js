const fs = require("fs");
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

function findRouters(dir) {
  return fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
        if (item.isDirectory()) {
          return findRouters(path.join(dir, item.name));
        }

        if (item.isFile() && item.name.endsWith(".router.js")) {
          return [path.join(dir, item.name)];
        }

        return [];
      })
    : [];
}

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:5001/development");

  for (const file of findRouters(path.join(__dirname, "src", "app"))) {
    const router = require(file);
    const relativePath = path.relative(__dirname, file).replace(/\\/g, "/");

    if (
      !router ||
      (typeof router === "object" && Object.keys(router).length === 0) ||
      typeof router !== "function"
    ) {
      console.log(`router: ${relativePath} -> está vacío`);
      continue;
    }

    app.use(router);
    console.log(`router: ${relativePath}`);
  }

  app.listen(3000, () => {
    console.log("api: http://localhost:3000");
    console.log("mongo: mongodb://127.0.0.1:5001/development");
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
