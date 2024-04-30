"use client";

import { Box, useColorModeValue } from "@chakra-ui/react";

interface TextUnderlineProps {
  children: React.ReactNode;
}

export const TextUnderline = ({ children }: TextUnderlineProps) => {
  return (
    <Box
      as={"span"}
      color={useColorModeValue("orange.400", "orange.300")}
      position={"relative"}
      zIndex={10}
      _after={{
        content: '""',
        position: "absolute",
        left: 0,
        bottom: 0,
        w: "full",
        h: "10%",
        bg: useColorModeValue("orange.100", "orange.900"),
        zIndex: -1,
      }}
    >
      {children}
    </Box>
  );
};
