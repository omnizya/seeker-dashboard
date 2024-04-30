"use client";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Link,
  Text,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";

type ExploreTemplatesProps = {
  templatesCount: number;
};
export const TEMPLATES_LINK: string = "/alef";
export const ExploreTemplates = ({ templatesCount }: ExploreTemplatesProps) => {
  return (
    <Box bg={useColorModeValue("orange.50", "gray.800")} dir="rtl">
      <Container maxW={"7xl"} py={{ base: 14, sm: 20, md: 32 }}>
        <Box
          bg={useColorModeValue("orange.400", "orange.500")}
          rounded={"xl"}
          color={useColorModeValue("white", "gray.100")}
          px={{ base: 4, md: 10 }}
          py={10}
        >
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <Box>
              <Heading as={"h3"} mb={2}>
                Explore {templatesCount - 1}+ Services
              </Heading>
              <Text fontSize={"lg"}>
                and start building beautiful websites & webapps today!
              </Text>
            </Box>
            <Flex w={"full"} align={"center"} justify={"center"}>
              <Button
                as={Link}
                href={TEMPLATES_LINK}
                bg="orange.600"
                color={"white"}
                px={8}
                size="lg"
                fontSize="md"
                rounded="md"
                rightIcon={<ArrowForwardIcon />}
                _hover={{
                  bg: "orange.700",
                }}
              >
                Browse Apps
              </Button>
            </Flex>
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
};
