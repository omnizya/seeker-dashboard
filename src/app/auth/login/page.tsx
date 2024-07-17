"use client";

import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { login } from "../actions";

const LoginPageText: { [x: string]: any } = {
  heading: "Sign in to your account",
  description: "to enjoy all of our cool features ✌️",
  form: {
    email: {
      label: "Email Address",
    },
    password: {
      label: "Password",
    },
    action: {
      checbox: "Remember me",
      forgotPass: "Forgot password?",
      login: "Sign in",
    },
  },
};

export default function LoginPage() {
  return (
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>{LoginPageText.heading}</Heading>
          <Text fontSize={"lg"} color={"gray.600"}>
            {LoginPageText.description}
          </Text>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Stack spacing={4}>
            <FormControl id="email">
              <FormLabel>{LoginPageText.form.email.label}</FormLabel>
              <Input type="email" />
            </FormControl>
            <FormControl id="password">
              <FormLabel>{LoginPageText.form.password.label}</FormLabel>
              <Input type="password" />
            </FormControl>
            <Stack spacing={10}>
              <Stack
                direction={{ base: "column", sm: "row" }}
                align={"start"}
                justify={"space-between"}
              >
                <Checkbox>{LoginPageText.form.action.checbox}</Checkbox>
                <Text color={"blue.400"}>
                  {LoginPageText.form.action.forgotPass}
                </Text>
              </Stack>
              <Button
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
                formAction={login}
              >
                {LoginPageText.form.action.login}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
