import fs from "node:fs";
import { CalcJomal } from "..";
import { createClient } from "@supabase/supabase-js";
import path from "node:path";
import readline from "node:readline";
import { CalcJomalT } from "~/types";
const supabase = createClient(
  "https://xaqstfhijcuwnsjmtsfb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhcXN0ZmhpamN1d25zam10c2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE4NDQ1MTEsImV4cCI6MjAyNzQyMDUxMX0.sBnaqqE269nwHP7C4ieUoXz54yGddXdYv7B502H9SNA"
);

const QuranByRevelation = "./src/data/tanzil-clean.txt";
const pushed = [];
async function InsertData(
  id: number,
  row: any,
  method: Function,
  table: string
) {
  const j: CalcJomalT = method(row);
  const { data, error } = await supabase
    .from(table)
    .upsert(
      {
        id,
        ayah: row,
        grand_east: j.ge,
        grand_west: j.gw,
        small_east: j.se,
        small_west: j.sw,
        nafsy: j.n,
      },
      {
        onConflict: "id",
      }
    )
    .select();
  if (error) console.error(error);
  pushed.push(data);
}

function splitFile(filePath: string, outputDir: string) {
  const inputData = fs.readFileSync(filePath, "utf-8");
  const chunks = inputData.split(/\r?\n/);
  chunks.forEach((chunk, index) => {
    const fileName = `${index + 1}.json`;
    fs.writeFileSync(
      path.join(outputDir, fileName),
      JSON.stringify(
        {
          id: index + 1,
          ayah: chunk,
          grand_east: CalcJomal(chunk).ge,
          grand_west: CalcJomal(chunk).gw,
          small_east: CalcJomal(chunk).se,
          small_west: CalcJomal(chunk).sw,
          nafsy: CalcJomal(chunk).n,
        },
        null,
        2
      )
    );
    // InsertData(index + 1, chunk, CalcJomal, "quran_revelation");
  });
}

splitFile(QuranByRevelation, "./src/data/chunk");

/* const parseInsert = () =>
  new Promise((resolve: any, reject: any) => {
    const promises: any = [];
    fs.createReadStream(path.resolve(QuranByRevelation))
      .on("error", reject)
      .on("data", (data: string) => {
        data = data.toString();
        const lines = data.split(/\r?\n/);
        lines.map((line: any, index: number) => {
          promises.push({ id: index, line: line });
          console.log("PUSH", index, line);
        });
      })
      .on("end", async () => {
        await Promise.all(
          promises.map((e: any) => {
            console.info(e);
            return e;
          })
        ).then((responses) =>
          responses.map((line: any) => {
            console.info("write", line.id, line.line);
            InsertData(
              line.id,
              line.line,
              CalcJomal,
              "QuranByRevelation_duplicate"
            );
            resolve();
            pushed.push(line);
          })
        );
        console.log("END", pushed.length);
      });
  });


parseInsert();
 */
