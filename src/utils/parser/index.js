import * as fs from "fs";
import * as path from "path";
import * as csv from "fast-csv";
import { CalcJomal } from "..";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://xaqstfhijcuwnsjmtsfb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhcXN0ZmhpamN1d25zam10c2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE4NDQ1MTEsImV4cCI6MjAyNzQyMDUxMX0.sBnaqqE269nwHP7C4ieUoXz54yGddXdYv7B502H9SNA"
);

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
