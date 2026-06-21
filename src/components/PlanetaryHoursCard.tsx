"use client";

import { useEffect, useState } from "react";
import { useGeolocation } from "@uidotdev/usehooks";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Container,
  Spinner,
  Center,
  Text,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";

import { computePlanetaryHours, PlanetaryHour } from "~/utils/planetary-hours";
import { DefaultText } from "~/texts";

function toLocalTime(d: Date) {
  return d.toLocaleTimeString("ar", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Build date string in YYYY-MM-DD for the sunrise-sunset API */
function dateParam(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function PlanetaryHoursCard() {
  const geo = useGeolocation();
  const [hours, setHours] = useState<PlanetaryHour[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFetching =
    !geo.loading && !geo.error && geo.latitude != null && geo.longitude != null && hours === null && error === null;

  const T = DefaultText.PlanetaryHours;

  useEffect(() => {
    if (
      geo.loading ||
      geo.error ||
      geo.latitude == null ||
      geo.longitude == null
    )
      return;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    Promise.all([
      fetch(
        `/api/sunrise?lat=${geo.latitude}&lng=${geo.longitude}&date=${dateParam(today)}`,
      ).then((r) => r.json()),
      fetch(
        `/api/sunrise?lat=${geo.latitude}&lng=${geo.longitude}&date=${dateParam(tomorrow)}`,
      ).then((r) => r.json()),
    ])
      .then(([todayData, tomorrowData]) => {
        if (todayData.error) {
          setError(todayData.error);
          return;
        }
        if (tomorrowData.error) {
          // Fallback: approximate night with same day length
          const sunrise = new Date(todayData.results.sunrise);
          const sunset = new Date(todayData.results.sunset);
          const dayLen = todayData.results.day_length * 1000;
          const nextSunrise = new Date(sunset.getTime() + (86400000 - dayLen));
          const result = computePlanetaryHours(
            todayData.results.sunrise,
            todayData.results.sunset,
            nextSunrise.toISOString(),
            today,
          );
          setHours(result);
          return;
        }
        const result = computePlanetaryHours(
          todayData.results.sunrise,
          todayData.results.sunset,
          tomorrowData.results.sunrise,
          today,
        );
        setHours(result);
      })
      .catch((e) => setError(e.message));
  }, [geo.latitude, geo.longitude, geo.loading, geo.error]);

  if (geo.loading) {
    return (
      <Container maxW="4xl" centerContent>
        <Card className="w-full p-4">
          <CardHeader>
            <Heading textAlign="center" w="full" size="md">
              {T.cardTitle}
            </Heading>
          </CardHeader>
          <CardBody>
            <Center>
              <Spinner />
              <Text mr={2}>جمع الموقع…</Text>
            </Center>
          </CardBody>
        </Card>
      </Container>
    );
  }

  if (geo.error) {
    return (
      <Container maxW="4xl" centerContent>
        <Card className="w-full p-4">
          <CardHeader>
            <Heading textAlign="center" w="full" size="md">
              {T.cardTitle}
            </Heading>
          </CardHeader>
          <CardBody>
            <Center>
              <Text>يرجى تفعيل صلاحية الموقع لعرض الساعات الكوكبية</Text>
            </Center>
          </CardBody>
        </Card>
      </Container>
    );
  }

  if (isFetching) {
    return (
      <Container maxW="4xl" centerContent>
        <Card className="w-full p-4">
          <CardHeader>
            <Heading textAlign="center" w="full" size="md">
              {T.cardTitle}
            </Heading>
          </CardHeader>
          <CardBody>
            <Center>
              <Spinner />
              <Text mr={2}>جاري التحميل…</Text>
            </Center>
          </CardBody>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="4xl" centerContent>
        <Card className="w-full p-4">
          <CardHeader>
            <Heading textAlign="center" w="full" size="md">
              {T.cardTitle}
            </Heading>
          </CardHeader>
          <CardBody>
            <Text textAlign="center" color="red.500">
              {error}
            </Text>
          </CardBody>
        </Card>
      </Container>
    );
  }

  if (!hours) return null;

  const dayHours = hours.filter((h) => h.isDaytime);
  const nightHours = hours.filter((h) => !h.isDaytime);

  const planetColors: Record<string, string> = {
    Saturn: "gray",
    Jupiter: "blue",
    Mars: "red",
    Sun: "orange",
    Venus: "green",
    Mercury: "yellow",
    Moon: "teal",
  };

  function renderTable(data: PlanetaryHour[]) {
    return (
      <TableContainer>
        <Table size="sm" variant="striped" colorScheme="purple">
          <Thead>
            <Tr>
              <Th textAlign="center">الكوكب</Th>
              <Th textAlign="center">البداية</Th>
              <Th textAlign="center">النهاية</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((h) => (
              <Tr key={h.hourIndex}>
                <Td textAlign="center">
                  <Badge colorScheme={planetColors[h.planet] || "gray"}>
                    {T.planets[h.planet]}
                  </Badge>
                </Td>
                <Td textAlign="center">{toLocalTime(h.start)}</Td>
                <Td textAlign="center">{toLocalTime(h.end)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Container maxW="4xl" centerContent>
      <Card className="w-full p-4">
        <CardHeader>
          <Heading textAlign="center" w="full" size="md">
            {T.cardTitle}
          </Heading>
        </CardHeader>
        <CardBody>
          <Tabs isFitted variant="enclosed" colorScheme="purple">
            <TabList mb="1em">
              <Tab>{T.dayLabel}</Tab>
              <Tab>{T.nightLabel}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel p={0}>{renderTable(dayHours)}</TabPanel>
              <TabPanel p={0}>{renderTable(nightHours)}</TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </Container>
  );
}
