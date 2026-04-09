import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs/promises";
import { PromptRecord } from "../models";

interface StorageFile {
  version: 1;
  prompts: PromptRecord[];
}

const STORAGE_FILE = "copilot-usage-tracker.json";

export class StorageService {
  private readonly filePath: string;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.filePath = path.join(context.globalStorageUri.fsPath, STORAGE_FILE);
  }

  async ensureReady(): Promise<void> {
    await fs.mkdir(this.context.globalStorageUri.fsPath, { recursive: true });

    try {
      await fs.access(this.filePath);
    } catch {
      await this.writeFile({ version: 1, prompts: [] });
    }
  }

  async getAllPrompts(): Promise<PromptRecord[]> {
    const file = await this.readFile();
    return file.prompts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async savePrompt(prompt: PromptRecord): Promise<void> {
    const file = await this.readFile();
    file.prompts.push(prompt);
    await this.writeFile(file);
  }

  async updatePrompt(promptId: string, patch: Partial<PromptRecord>): Promise<PromptRecord | undefined> {
    const file = await this.readFile();
    const index = file.prompts.findIndex((entry) => entry.id === promptId);

    if (index < 0) {
      return undefined;
    }

    file.prompts[index] = { ...file.prompts[index], ...patch };
    await this.writeFile(file);
    return file.prompts[index];
  }

  async exportToPath(targetPath: string): Promise<void> {
    const file = await this.readFile();
    await fs.writeFile(targetPath, JSON.stringify(file, null, 2), "utf8");
  }

  private async readFile(): Promise<StorageFile> {
    await this.ensureReady();
    const raw = await fs.readFile(this.filePath, "utf8");
    return JSON.parse(raw) as StorageFile;
  }

  private async writeFile(data: StorageFile): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf8");
  }
}
