"use client";

import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  HStack,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
} from "@chakra-ui/react";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { signup } from "../actions";

const SignupCardText: { [x: string]: any } = {
  heading: "Sign up",
  description: "to enjoy all of our cool features ✌️",
  form: {
    firstName: {
      label: "First Name",
    },
    lastName: {
      label: "Last Name",
    },
    email: {
      label: "Email Address",
    },
    password: {
      label: "Password",
    },
    action: {
      loadingText: "Submitting",
      buttonText: "Sign up",
    },
    footerText: "Already a user?",
    LoginLink: "Login",
  },
};

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            {SignupCardText.heading}
          </Heading>
          <Text fontSize={"lg"} color={"gray.600"}>
            {SignupCardText.description}
          </Text>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Stack spacing={4}>
            <HStack>
              <Box>
                <FormControl id="firstName" isRequired>
                  <FormLabel>{SignupCardText.form.firstName.label}</FormLabel>
                  <Input type="text" />
                </FormControl>
              </Box>
              <Box>
                <FormControl id="lastName">
                  <FormLabel>{SignupCardText.form.lastName.label}</FormLabel>
                  <Input type="text" />
                </FormControl>
              </Box>
            </HStack>
            <FormControl id="email" isRequired>
              <FormLabel>{SignupCardText.form.email.label}</FormLabel>
              <Input type="email" />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>{SignupCardText.form.password.label}</FormLabel>
              <InputGroup>
                <Input type={showPassword ? "text" : "password"} />
                <InputRightElement h={"full"}>
                  <Button
                    variant={"ghost"}
                    onClick={() =>
                      setShowPassword((showPassword) => !showPassword)
                    }
                  >
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Stack spacing={10} pt={2}>
              <Button
                loadingText={SignupCardText.form.action.loadingText}
                size="lg"
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
                formAction={signup}
              >
                {SignupCardText.form.action.buttonText}
              </Button>
            </Stack>
            <Stack pt={6}>
              <Text align={"center"}>
                {SignupCardText.form.footerText}{" "}
                <Link color={"blue.400"} href="/login">
                  {SignupCardText.form.LoginLink}
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
