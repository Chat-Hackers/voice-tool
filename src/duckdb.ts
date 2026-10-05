import { DuckDBConnection, DuckDBInstance } from "@duckdb/node-api";
import path from "node:path";
import { GroupUrl } from "../types";

let connection: DuckDBConnection;
let instance: DuckDBInstance;

export async function startDuckDB() {
    const voiceDuckDBFileName = "voice_duckdb.db";

    const dataDir = process.env.DUCKDB_DATA_DIR ?? path.resolve(__dirname, "../..");
    const dbPath = path.join(dataDir, voiceDuckDBFileName);

    instance = await DuckDBInstance.create(dbPath);
    connection = await instance.connect();

    const tables = [
        {
            name: "GroupUrls",
            creationCommand:
                "CREATE TABLE GroupUrls (room_id VARCHAR, url VARCHAR);",
        }
    ]

    const existingTablesRows = await connection.run("SHOW TABLES;");
    const existingTables = await existingTablesRows.getRowObjects();

    tables.forEach(async (table) => {
        const tableExists = existingTables.filter((existingTable) => existingTable.name === table.name).length > 0;

        if (tableExists) {
            console.log(`${table.name} already exists`);
        } else {
            await connection.run(table.creationCommand);
            console.log(`${table.name} created`);
        }
    });
}

export async function getGroupUrl(roomId: string) {
    const getGroupUrl = `SELECT * FROM GroupUrls WHERE room_id = $1;`;
    const prepared = await connection.prepare(getGroupUrl);
    prepared.bindVarchar(1, roomId);
    const groupUrlRows = await prepared.run();
    const groupUrls = await groupUrlRows.getRowObjects();
    return groupUrls[0] as GroupUrl;
}

export async function insertGroupUrl(roomId: string, url: string) {
    const insertGroupUrl = `INSERT INTO GroupUrls (room_id, url) VALUES ($1, $2);`;
    const prepared = await connection.prepare(insertGroupUrl);
    prepared.bindVarchar(1, roomId);
    prepared.bindVarchar(2, url);
    await prepared.run();
}

export async function deleteGroupUrl(roomId: string) {
    const deleteGroupUrl = `DELETE FROM GroupUrls WHERE room_id=$1;`;
    const prepared = await connection.prepare(deleteGroupUrl);
    prepared.bindVarchar(1, roomId);
    await prepared.run();
}