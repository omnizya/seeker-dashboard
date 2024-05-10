"use client";

import {
  Box,
  Flex,
  Avatar,
  HStack,
  Text,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  AvatarBadge,
  Center,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { DefaultText } from "~/texts";
import Link from "next/link";
import Image from "next/image";

interface Props {
  children: React.ReactNode;
  to: string;
}

const Links = [
  DefaultText.dashboard.navbar.links.a,
  DefaultText.dashboard.navbar.links.b,
  DefaultText.dashboard.navbar.links.c,
  DefaultText.dashboard.navbar.links.d,
];

const NavLink = (props: Props) => {
  const { children, to } = props;

  return (
    <Box
      as="a"
      px={2}
      py={1}
      rounded={"md"}
      _hover={{
        textDecoration: "none",
        bg: useColorModeValue("purpke.200", "purple.700"),
      }}
    >
      <Link href={to}>{children}</Link>
    </Box>
  );
};

export default function Simple() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            size={"md"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={"center"}>
            <Box>
              <Image src={"/favico.svg"} alt="logo" height={44} width={44} />
            </Box>

            <HStack
              as={"nav"}
              spacing={4}
              display={{ base: "none", md: "flex" }}
            >
              {Links.map((link, i) => (
                <NavLink key={i} to={link.href}>
                  {link.label}
                </NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={"center"}>
            <Menu>
              <MenuButton
                as={Button}
                rounded={"full"}
                variant={"link"}
                cursor={"pointer"}
                minW={0}
              >
                <Avatar size={"md"} bg={"purple"}>
                  <AvatarBadge
                    borderColor="papayawhip"
                    bg="tomato"
                    boxSize="1.25em"
                  />
                </Avatar>
              </MenuButton>
              <MenuList>
                <MenuItem>TBD</MenuItem>
                <MenuItem>TBD</MenuItem>
                <MenuDivider />
                <MenuItem>TBD</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as={"nav"} spacing={4}>
              {Links.map((link, i) => (
                <NavLink key={link.href + i} to={link.href}>
                  {link.label}
                </NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
}
