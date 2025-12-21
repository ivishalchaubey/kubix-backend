#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 👇 Equivalent of __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const moduleName = process.argv[2];
if (!moduleName) {
  console.error("❌ Please provide a module name. Example: node generate-module.js User");
  process.exit(1);
}

const baseDir = path.join(__dirname, "src", moduleName.toLowerCase());
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

// Convert names
const className = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
const fileName = moduleName.toLowerCase();

// -------- Model --------
const modelContent = `
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ${className} = sequelize.define("${fileName}", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true },
}, {
  timestamps: true,
});

export default ${className};
`;

// -------- Repository --------
const repositoryContent = `
import ${className} from "./${fileName}.model.js";

class ${className}Repository {
  async create(data) {
    return await ${className}.create(data);
  }

  async findAll() {
    return await ${className}.findAll();
  }

  async findById(id) {
    return await ${className}.findByPk(id);
  }

  async update(id, data) {
    const record = await ${className}.findByPk(id);
    if (!record) return null;
    return await record.update(data);
  }

  async delete(id) {
    const record = await ${className}.findByPk(id);
    if (!record) return null;
    await record.destroy();
    return true;
  }
}

export default new ${className}Repository();
`;

// -------- Service --------
const serviceContent = `
import ${className}Repository from "./${fileName}.repository.js";

class ${className}Service {
  async create(data) {
    return await ${className}Repository.create(data);
  }

  async getAll() {
    return await ${className}Repository.findAll();
  }

  async getById(id) {
    return await ${className}Repository.findById(id);
  }

  async update(id, data) {
    return await ${className}Repository.update(id, data);
  }

  async delete(id) {
    return await ${className}Repository.delete(id);
  }
}

export default new ${className}Service();
`;

// -------- Controller --------
const controllerContent = `
import ${className}Service from "./${fileName}.service.js";

class ${className}Controller {
  async create(req, res) {
    try {
      const data = await ${className}Service.create(req.body);
      res.status(201).json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getAll(req, res) {
    const data = await ${className}Service.getAll();
    res.json(data);
  }

  async getById(req, res) {
    const data = await ${className}Service.getById(req.params.id);
    if (!data) return res.status(404).json({ message: "${className} not found" });
    res.json(data);
  }

  async update(req, res) {
    const data = await ${className}Service.update(req.params.id, req.body);
    if (!data) return res.status(404).json({ message: "${className} not found" });
    res.json(data);
  }

  async delete(req, res) {
    const success = await ${className}Service.delete(req.params.id);
    if (!success) return res.status(404).json({ message: "${className} not found" });
    res.json({ message: "${className} deleted" });
  }
}

export default new ${className}Controller();
`;

// -------- Routes --------
const routeContent = `
import express from "express";
import ${className}Controller from "./${fileName}.controller.js";

const router = express.Router();

router.post("/", (req, res) => ${className}Controller.create(req, res));
router.get("/", (req, res) => ${className}Controller.getAll(req, res));
router.get("/:id", (req, res) => ${className}Controller.getById(req, res));
router.put("/:id", (req, res) => ${className}Controller.update(req, res));
router.delete("/:id", (req, res) => ${className}Controller.delete(req, res));

export default router;
`;

// -------- Write files --------
fs.writeFileSync(path.join(baseDir, `${fileName}.model.js`), modelContent.trim());
fs.writeFileSync(path.join(baseDir, `${fileName}.repository.js`), repositoryContent.trim());
fs.writeFileSync(path.join(baseDir, `${fileName}.service.js`), serviceContent.trim());
fs.writeFileSync(path.join(baseDir, `${fileName}.controller.js`), controllerContent.trim());
fs.writeFileSync(path.join(baseDir, `${fileName}.routes.js`), routeContent.trim());

console.log(`✅ Module "${className}" generated successfully at ${baseDir}`);
