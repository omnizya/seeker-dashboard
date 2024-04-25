"use client";

import {
  Box,
  Container,
  Flex,
  Text,
  Stack,
  Heading,
  useColorModeValue,
  Button,
  Icon,
  createIcon,
  VStack,
  IconProps,
  useBreakpointValue,
} from "@chakra-ui/react";
import { ExploreTemplates } from "~/components/AlefpageSection/ExploreTemplates";
import { TextUnderline } from "~/components/TextUnderLine";
import Footer from "~/components/Footer";
import Illustration from "~/components/Illustration";
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

export default function Home() {
  return (
    <>
      <Flex
        w={"full"}
        h={"100vh"}
        backgroundImage={
          "url(https://images.unsplash.com/photo-1600267175161-cfaa711b4a81?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)"
        }
        backgroundSize={"cover"}
        backgroundPosition={"center center"}
      >
        <VStack
          w={"full"}
          justify={"center"}
          px={useBreakpointValue({ base: 4, md: 8 })}
          bgGradient={"linear(to-r, blackAlpha.600, transparent)"}
        >
          <Stack maxW={"2xl"} align={"flex-start"} spacing={6}>
            <Text
              color={"white"}
              fontWeight={700}
              lineHeight={1.2}
              fontSize={useBreakpointValue({ base: "3xl", md: "4xl" })}
            >
              Lorem ipsum dolor sit amet consectetur adipiscing elit sed do
              eiusmod tempor
            </Text>
            <Stack direction={"row"}>
              <Button
                bg={"blue.400"}
                rounded={"full"}
                color={"white"}
                _hover={{ bg: "blue.500" }}
              >
                Show me more
              </Button>
              <Button
                bg={"whiteAlpha.300"}
                rounded={"full"}
                color={"white"}
                _hover={{ bg: "whiteAlpha.500" }}
              >
                Show me more
              </Button>
            </Stack>
          </Stack>
        </VStack>
      </Flex>
      <Container maxW={"5xl"}>
        <Stack
          textAlign={"center"}
          align={"center"}
          spacing={{ base: 8, md: 10 }}
          py={{ base: 20, md: 28 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: "3xl", sm: "4xl", md: "6xl" }}
            lineHeight={"110%"}
          >
            Meeting scheduling{" "}
            <Text as={"span"} color={"orange.400"}>
              made easy
            </Text>
          </Heading>
          <Text color={"gray.500"} maxW={"3xl"}>
            Never miss a meeting. Never be late for one too. Keep track of your
            meetings and receive smart reminders in appropriate times. Read your
            smart “Daily Agenda” every morning.
          </Text>
          <Stack spacing={6} direction={"row"}>
            <Button
              rounded={"full"}
              px={6}
              colorScheme={"orange"}
              bg={"orange.400"}
              _hover={{ bg: "orange.500" }}
            >
              Get started
            </Button>
            <Button rounded={"full"} px={6}>
              Learn more
            </Button>
          </Stack>
          <Flex w={"full"}>
            <Illustration
              height={{ sm: "24rem", lg: "28rem" }}
              mt={{ base: 12, sm: 16 }}
            />
          </Flex>
        </Stack>
      </Container>
      <Box bg={useColorModeValue("gray.50", "gray.900")}>
        <Container maxW={"7xl"} py={{ base: 14, sm: 20, md: 32 }}>
          <Heading as={"h3"} textAlign={"center"} mb={{ base: 14, sm: 16 }}>
            <TextUnderline>وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ </TextUnderline>
            فَادْعُوهُ بِهَا ۖ وَذَرُوا الَّذِينَ يُلْحِدُونَ فِي أَسْمَائِهِ ۚ
            سَيُجْزَوْنَ مَا كَانُوا يَعْمَلُونَ
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
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  bg={useColorModeValue("green.100", "green.900")}
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  color={useColorModeValue("green.700", "green.300")}
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
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  color={useColorModeValue("gray.700", "white")}
                >
                  {step.title}
                </Text>
                <Text color={"gray.500"}>{step.text}</Text>
              </Stack>
            ))}
          </Flex>
          <ExploreTemplates templatesCount={19!} />
        </Container>
      </Box>
      <Footer />
    </>
  );
}
const Arrow = createIcon({
  displayName: "Arrow",
  viewBox: "0 0 72 24",
  path: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0.600904 7.08166C0.764293 6.8879 1.01492 6.79004 1.26654 6.82177C2.83216 7.01918 5.20326 7.24581 7.54543 7.23964C9.92491 7.23338 12.1351 6.98464 13.4704 6.32142C13.84 6.13785 14.2885 6.28805 14.4722 6.65692C14.6559 7.02578 14.5052 7.47362 14.1356 7.6572C12.4625 8.48822 9.94063 8.72541 7.54852 8.7317C5.67514 8.73663 3.79547 8.5985 2.29921 8.44247C2.80955 9.59638 3.50943 10.6396 4.24665 11.7384C4.39435 11.9585 4.54354 12.1809 4.69301 12.4068C5.79543 14.0733 6.88128 15.8995 7.1179 18.2636C7.15893 18.6735 6.85928 19.0393 6.4486 19.0805C6.03792 19.1217 5.67174 18.8227 5.6307 18.4128C5.43271 16.4346 4.52957 14.868 3.4457 13.2296C3.3058 13.0181 3.16221 12.8046 3.01684 12.5885C2.05899 11.1646 1.02372 9.62564 0.457909 7.78069C0.383671 7.53862 0.437515 7.27541 0.600904 7.08166ZM5.52039 10.2248C5.77662 9.90161 6.24663 9.84687 6.57018 10.1025C16.4834 17.9344 29.9158 22.4064 42.0781 21.4773C54.1988 20.5514 65.0339 14.2748 69.9746 0.584299C70.1145 0.196597 70.5427 -0.0046455 70.931 0.134813C71.3193 0.274276 71.5206 0.70162 71.3807 1.08932C66.2105 15.4159 54.8056 22.0014 42.1913 22.965C29.6185 23.9254 15.8207 19.3142 5.64226 11.2727C5.31871 11.0171 5.26415 10.5479 5.52039 10.2248Z"
      fill="currentColor"
    />
  ),
});
