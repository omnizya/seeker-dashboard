/* eslint-disable react-hooks/rules-of-hooks */
import {
  useColorModeValue,
  Container,
  Heading,
  Flex,
  Stack,
  Box,
  Text,
} from "@chakra-ui/react";
import { ExploreTemplates } from "~/components/AlefpageSection/ExploreTemplates";
import Illustration from "../Illustration";
export default function Features() {
  const STEPS = [
    {
      title: "Find your template",
      text: "Every template is embedded within an iframe, so you can easily check what they look like and test the responsive behaviour.",
    },
    {
      title: "Copy the code",
      text: "Click the code tab to see the actual source code of the template. Copy and paste it into your project and adjust it to your needs.",
    },
    {
      title: "Enjoy your free time",
      text: "You've just saved yourself a bunch of time not building the same stuff over and over again. Enjoy your free time, and build business features",
    },
  ];
  return (
    <Box
      bg={useColorModeValue("gray.50", "gray.900")}
      h={"full"}
      bgGradient={"linear(to-t, blackAlpha.900, purple)"}
    >
      <Container maxW={"8xl"} py={{ sm: "8px", md: "12px", lg: "16px" }}>
        <Flex
          w={"full"}
          justifyContent={"center"}
          alignItems={"center"}
          p={"2em"}
        >
          <Illustration height={{ sm: "20rem", lg: "24rem" }} />
        </Flex>
        <Heading
          as={"h3"}
          textAlign={"center"}
          mb={{ base: 14, sm: 16 }}
          color={"orange"}
        >
          Features
        </Heading>

        <Flex
          direction={{ base: "column", md: "row" }}
          justify={"space-between"}
          align={{ base: "center", md: "flex-start" }}
        >
          {STEPS.map((step, index) => (
            <Stack
              textAlign={{ base: "left", md: "center" }}
              align={{ base: "flex-start", md: "center" }}
              spacing={4}
              key={step.title}
              maxW={{ base: "full", md: "xs" }}
              mt={{ base: 10, md: 0 }}
              _first={{
                mt: 0,
              }}
              px={4}
            >
              <Flex
                w={10}
                h={10}
                bg={useColorModeValue("orange.100", "orange.900")}
                color={useColorModeValue("orange.700", "orange.300")}
                fontWeight={700}
                align={"center"}
                justify={"center"}
                fontSize={"sm"}
                rounded={"md"}
              >
                0{index + 1}
              </Flex>
              <Text
                fontFamily={"heading"}
                fontSize={"xl"}
                color={useColorModeValue("gray.700", "white")}
              >
                {step.title}
              </Text>
              <Text color={"gray.500"}>{step.text}</Text>
            </Stack>
          ))}
        </Flex>
        <ExploreTemplates templatesCount={3!} />
      </Container>
    </Box>
  );
}
