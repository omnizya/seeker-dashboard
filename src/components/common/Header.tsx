"use client";

import {
  Box,
  Container,
  Flex,
  IconButton,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
export const Header = () => {
  const { isOpen: isMobileNavOpen, onToggle } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Box as="header">
      <Flex>
        <Container>
          <Flex flex={{ base: "0", md: "auto" }}>
            <IconButton
              onClick={onToggle}
              icon={
                isMobileNavOpen ? (
                  <CloseIcon w={3} h={3} />
                ) : (
                  <HamburgerIcon w={3} h={3} />
                )
              }
              aria-label={"Toggle Navigation"}
            />
          </Flex>
        </Container>
      </Flex>
    </Box>
  );
};
