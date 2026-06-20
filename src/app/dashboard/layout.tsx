export const dynamic = "force-dynamic";

import { Box, Center, Container } from "@chakra-ui/react";
import GeoDataCard from "~/components/GeoDataCard";
import NavigationBar from "~/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box as={"main"} h={"100vh"}>
      <NavigationBar />
      <GeoDataCard />
      <Center height={"90vh"}>
        <Container maxW={"8xl"}>{children}</Container>
      </Center>
    </Box>
  );
}
