"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
async function globalSetup() {
    const dbPath = (0, path_1.join)(__dirname, '..', 'dev.db');
    const testDbPath = (0, path_1.join)(__dirname, '..', 'test.db');
    // Rename instead of delete — avoids EBUSY on Windows when file is locked
    if ((0, fs_1.existsSync)(dbPath)) {
        try {
            (0, fs_1.unlinkSync)(dbPath);
        }
        catch {
            try {
                (0, fs_1.renameSync)(dbPath, dbPath + '.bak');
            }
            catch { }
        }
    }
    if ((0, fs_1.existsSync)(testDbPath)) {
        try {
            (0, fs_1.unlinkSync)(testDbPath);
        }
        catch { }
    }
    (0, child_process_1.execSync)('npx prisma db push', { cwd: (0, path_1.join)(__dirname, '..'), stdio: 'pipe' });
}
exports.default = globalSetup;
//# sourceMappingURL=setup.js.map