"use client";
import { useState } from "react";
import { track } from "@vercel/analytics/react";
import { CalcJomal } from "~/utils";
import { DefaultText } from "~/texts";
import { CalcJomalT } from "~/types";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";

export default function JummalCard() {
  const [jomalValues, setJomalValues] = useState<CalcJomalT>({
    ge: 0,
    gw: 0,
    se: 0,
    sw: 0,
    n: 0,
  });
  const [dotless, setDotless] = useState(false);
  const submitContact = async (event: any) => {
    let inputValue = event.target.value;
    event.preventDefault();
    track("CalcJummal", { input: inputValue, dotless });
    setJomalValues(CalcJomal(inputValue, { dotless }));
  };
  return (
    <div className="flex flex-col items-center w-full">
      <Card className="w-full max-w-4xl p-4">
        <CardHeader className="flex gap-3 p-2">
          <CardTitle className="text-center w-full">
            {DefaultText.JummalCard.cardTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <Checkbox
              id="dotless"
              checked={dotless}
              onCheckedChange={(v) => {
                const next = v === true;
                setDotless(next);
                // Recompute with existing textarea value if any
                const ta = document.getElementById("jummal-input") as HTMLTextAreaElement | null;
                if (ta && ta.value) {
                  setJomalValues(CalcJomal(ta.value, { dotless: next }));
                }
              }}
            />
            <Label htmlFor="dotless">{DefaultText.JummalCard.dotlessToggle}</Label>
          </div>
          <Textarea
            id="jummal-input"
            placeholder={DefaultText.JummalCard.textAreaPlaceholder}
            className="w-full p-2 h-20"
            required
            onChange={submitContact}
          />
        </CardContent>
      </Card>

      <div className="w-full max-w-4xl">
        <div className="py-4 text-center text-xl font-bold text-orange-500 bg-purple-600 rounded-md">
          {DefaultText.JummalCard.outputTable.title}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center text-lg">
                {DefaultText.JummalCard.outputTable.tableHeader.east}
              </TableHead>
              <TableHead className="text-center text-lg">
                {DefaultText.JummalCard.outputTable.tableHeader.west}
              </TableHead>
              <TableHead className="text-center text-lg">
                {DefaultText.JummalCard.outputTable.tableHeader.nafsy}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="even:bg-muted/50">
              <TableCell className="text-center text-lg">
                <div className="flex gap-2 justify-center">
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-muted-foreground">الكبير</span>
                    <Badge variant="secondary">{jomalValues.ge}</Badge>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-muted-foreground">الصغير</span>
                    <Badge variant="secondary">{jomalValues.se}</Badge>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center text-lg">
                <div className="flex gap-2 justify-center">
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-muted-foreground">الكبير</span>
                    <Badge variant="secondary">{jomalValues.gw}</Badge>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-muted-foreground">الصغير</span>
                    <Badge variant="secondary">{jomalValues.sw}</Badge>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center text-lg">
                <Badge variant="secondary">{jomalValues.n}</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
