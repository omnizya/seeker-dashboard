"use client";
import {
  Container,
  Flex,
  Text,
  Stack,
  Heading,
  Button,
  VStack,
  IconProps,
  useBreakpointValue,
} from "@chakra-ui/react";

import Footer from "~/components/Footer/appFooter";

import Features from "~/components/AlefpageSection/Features";
import { DefaultText } from "~/texts";
import { track } from "@vercel/analytics/react";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter();
  return (
    <>
      <Flex
        w={"full"}
        h={"100vh"}
        backgroundImage={"url(/cube.jpg)"}
        backgroundSize={"cover"}
        backgroundPosition={"center center"}
        backgroundAttachment={"fixed"}
      >
        <VStack
          w={"full"}
          justify={"center"}
          px={useBreakpointValue({ base: 4, md: 8 })}
          bgGradient={"linear(to-b, blackAlpha.600, purple)"}
        >
          <Stack align={"flex-start"} spacing={6}>
            <Container maxW={"6xl"}>
              <Stack
                textAlign={"center"}
                align={"center"}
                spacing={{ base: 8, md: 10 }}
                py={{ base: 20, md: 28 }}
              >
                <Heading
                  fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
                  lineHeight={"150%"}
                  className="font-uthman text-whiten shadow-purple-600 drop-shadow-lg"
                >
                  وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا ۖ وَذَرُوا
                  الَّذِينَ يُلْحِدُونَ فِي أَسْمَائِهِ ۚ سَيُجْزَوْنَ مَا
                  كَانُوا يَعْمَلُونَ
                </Heading>

                <Stack spacing={6} direction={"row"}>
                  <Button
                    rounded={"full"}
                    px={6}
                    colorScheme={"orange"}
                    bg={"orange.400"}
                    _hover={{ bg: "orange.500" }}
                    onClick={() => {
                      track("Get Started");
                      router.push("/dashboard");
                    }}
                  >
                    {DefaultText.landingPage.callToActions.getStarted}
                  </Button>
                  <Button
                    rounded={"full"}
                    px={6}
                    onClick={() => {
                      track("Pressed Learn More");
                      router.push("/learn");
                    }}
                  >
                    {DefaultText.landingPage.callToActions.learnMore}
                  </Button>
                </Stack>
              </Stack>
            </Container>
          </Stack>
        </VStack>
      </Flex>

      {/*   <Features /> */}
      <Footer />
    </>
  );
}
