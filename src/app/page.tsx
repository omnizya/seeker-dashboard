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

import { TextUnderline } from "~/components/TextUnderLine";
import Footer from "~/components/Footer";
import Illustration from "~/components/Illustration";
import Features from "~/components/AlefpageSection/Features";


export default function Home() {
  return (
    <>
      <Flex
        w={"full"}
        h={"100vh"}
        backgroundImage={
          "url(https://r4.wallpaperflare.com/wallpaper/205/702/475/digital-art-fantasy-art-books-candles-wallpaper-99e0384d212a6d8b56b7b87fc05106fd.jpg)"
        }
        backgroundSize={"cover"}
        backgroundPosition={"center center"}
        backgroundAttachment={"fixed"}
      >
        <VStack
          w={"full"}
          justify={"center"}
          px={useBreakpointValue({ base: 4, md: 8 })}
          bgGradient={"linear(to-r, blackAlpha.600, transparent)"}
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
                  fontWeight={600}
                  fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
                  lineHeight={"110%"}
                  className="font-uthman"
                >
                  <TextUnderline>
                    وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ
                  </TextUnderline>
                  <br />
                  <Text
                    as={"span"}
                    color={"orange.400"}
                    fontSize={{ base: "xl" }}
                  >
                    فَادْعُوهُ بِهَا ۖ
                  </Text>
                  <Text color={"white"} maxW={"2xl"} fontSize={{ base: "xl" }}>
                    وَذَرُوا الَّذِينَ يُلْحِدُونَ فِي أَسْمَائِهِ ۚ
                    سَيُجْزَوْنَ مَا كَانُوا يَعْمَلُونَ
                  </Text>
                </Heading>

                <Flex
                  w={"full"}
                  backgroundColor={"red.600"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  p={"2em"}
                >
                  <Illustration height={{ sm: "20rem", lg: "24rem" }} />
                </Flex>
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
              </Stack>
            </Container>
          </Stack>
        </VStack>
      </Flex>

<Features />
      <Footer />
    </>
  );
}
