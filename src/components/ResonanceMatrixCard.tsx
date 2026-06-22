"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { DefaultText } from "~/texts";
import { generateResonanceMatrix } from "~/utils";

export default function ResonanceMatrixCard() {
  const [seed, setSeed] = useState(15);
  const matrix = generateResonanceMatrix(seed);

  return (
    <div className="flex flex-col items-center w-full">
      <Card className="w-full max-w-4xl p-4">
        <CardHeader className="flex gap-3 p-2">
          <CardTitle className="text-center w-full">
            {DefaultText.ResonanceMatrixCard.cardTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Label htmlFor="resonance-seed" className="text-nowrap">
              {DefaultText.ResonanceMatrixCard.seedLabel}
            </Label>
            <Input
              id="resonance-seed"
              type="number"
              value={seed}
              onChange={(e) => setSeed(parseInt(e.target.value, 10) || 0)}
              placeholder={DefaultText.ResonanceMatrixCard.seedPlaceholder}
              className="w-32"
            />
          </div>

          {seed >= 12 && (
            <div className="flex gap-4 mb-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  {DefaultText.ResonanceMatrixCard.bLabel} =
                </span>{" "}
                <span className="font-mono font-bold">{matrix.B}</span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {DefaultText.ResonanceMatrixCard.rLabel} =
                </span>{" "}
                <span className="font-mono font-bold">{matrix.R}</span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {DefaultText.ResonanceMatrixCard.magicConstant} =
                </span>{" "}
                <span className="font-mono font-bold">
                  {matrix.magicConstant}
                </span>
              </div>
              <Badge variant={matrix.isMagic ? "default" : "destructive"}>
                {matrix.isMagic
                  ? DefaultText.ResonanceMatrixCard.isMagic
                  : DefaultText.ResonanceMatrixCard.notMagic}
              </Badge>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
            {matrix.matrix.map((row, ri) =>
              row.map((val, ci) => (
                <div
                  key={`${ri}-${ci}`}
                  className="flex items-center justify-center h-14 w-14 rounded-md border bg-muted font-mono text-lg font-bold"
                >
                  {val}
                </div>
              )),
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
