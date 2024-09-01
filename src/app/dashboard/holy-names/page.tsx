"use client";
import { Box } from "@chakra-ui/react";
import { HolyNames } from "~/components/HolyNames";

export default function HolyNamesPage() {
  return (
    <Box p={4} maxWidth={"min-content"}>
      <HolyNames />
    </Box>
  );
}
