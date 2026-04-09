"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const STORAGE_FILE = "copilot-usage-tracker.json";
class StorageService {
    context;
    filePath;
    constructor(context) {
        this.context = context;
        this.filePath = path.join(context.globalStorageUri.fsPath, STORAGE_FILE);
    }
    async ensureReady() {
        await fs.mkdir(this.context.globalStorageUri.fsPath, { recursive: true });
        try {
            await fs.access(this.filePath);
        }
        catch {
            await this.writeFile({ version: 1, prompts: [] });
        }
    }
    async getAllPrompts() {
        const file = await this.readFile();
        return file.prompts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    async savePrompt(prompt) {
        const file = await this.readFile();
        file.prompts.push(prompt);
        await this.writeFile(file);
    }
    async updatePrompt(promptId, patch) {
        const file = await this.readFile();
        const index = file.prompts.findIndex((entry) => entry.id === promptId);
        if (index < 0) {
            return undefined;
        }
        file.prompts[index] = { ...file.prompts[index], ...patch };
        await this.writeFile(file);
        return file.prompts[index];
    }
    async exportToPath(targetPath) {
        const file = await this.readFile();
        await fs.writeFile(targetPath, JSON.stringify(file, null, 2), "utf8");
    }
    async readFile() {
        await this.ensureReady();
        const raw = await fs.readFile(this.filePath, "utf8");
        return JSON.parse(raw);
    }
    async writeFile(data) {
        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf8");
    }
}
exports.StorageService = StorageService;
//# sourceMappingURL=storage.js.map