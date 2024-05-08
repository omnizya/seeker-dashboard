import * as fs from "fs";
import * as path from "path";
import * as csv from "fast-csv";
import { CalcJomal } from "..";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://.supabase.co", "..");

const parseInsert = () =>
  new Promise((resolve, reject) => {
    const promises = [];
    fs.createReadStream(path.resolve(__dirname, "../../data", "holy_names.csv"))
      .pipe(csv.parse({ headers: true }))
      .on("error", reject)
      .on("data", (row) => {
        promises.push(InsertData(row, CalcJomal, "holy_names"));
        console.log("PUSH");
      })
      .on("end", async () => {
        await Promise.all(promises);
        console.log("END");
        resolve();
      });
  });

async function InsertData(row, method, table) {
  const j = method(row.holy_name);
  const { data, error } = await supabase
    .from(table)
    .insert({ name: row.holy_name, east: j.east.base, west: j.west.base })
    .select();
  console.log(data);
  console.error(error);
}

parseInsert();
