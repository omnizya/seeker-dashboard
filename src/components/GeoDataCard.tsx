"use client";

import { useEffect, useState } from "react";
import { GeolocationState, useGeolocation } from "@uidotdev/usehooks";
import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Container,
  Spinner,
  Center,
  Text,
} from "@chakra-ui/react";

type SunriseResult = {
  sunrise: string;
  sunset: string;
  solar_noon: string;
  day_length: number;
  civil_twilight_begin: string;
  civil_twilight_end: string;
  nautical_twilight_begin: string;
  nautical_twilight_end: string;
  astronomical_twilight_begin: string;
  astronomical_twilight_end: string;
};

function toLocalTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("ar", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function GeoDataCard() {
  const geo = useGeolocation();
  const [data, setData] = useState<SunriseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFetching =
    !geo.loading && !geo.error && geo.latitude != null && geo.longitude != null && data === null && error === null;

  useEffect(() => {
    if (geo.loading || geo.error || geo.latitude == null || geo.longitude == null)
      return;

    fetch(
      `/api/sunrise?lat=${geo.latitude}&lng=${geo.longitude}`
    )
      .then((r) => r.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
        } else {
          setData(json.results);
        }
      })
      .catch((e) => setError(e.message));
  }, [geo.latitude, geo.longitude, geo.loading, geo.error]);

  if (geo.loading) {
    return (
      <Container maxW="4xl" centerContent>
        <Card className="w-full p-4">
          <CardHeader>
            <Heading textAlign="center" w="full" size="md">
              أوقات الشمس
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
              أوقات الشمس
            </Heading>
          </CardHeader>
          <CardBody>
            <Center>
              <Text>يرجى تفعيل صلاحية الموقع لعرض أوقات الشمس</Text>
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
              أوقات الشمس
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
              أوقات الشمس
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

  if (!data) return null;

  return (
    <Container maxW="4xl" centerContent>
      <Card className="w-full p-4">
        <CardHeader>
          <Heading textAlign="center" w="full" size="md">
            أوقات الشمس
          </Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
            <Stat>
              <StatLabel>الشروق</StatLabel>
              <StatNumber>{toLocalTime(data.sunrise)}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>الغروب</StatLabel>
              <StatNumber>{toLocalTime(data.sunset)}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>منتصف النهار</StatLabel>
              <StatNumber>{toLocalTime(data.solar_noon)}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>طول النهار</StatLabel>
              <StatNumber>{formatDuration(data.day_length)}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>بداية الشفق المدني</StatLabel>
              <StatNumber>{toLocalTime(data.civil_twilight_begin)}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>نهاية الشفق المدني</StatLabel>
              <StatNumber>{toLocalTime(data.civil_twilight_end)}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>بداية الشفق البحري</StatLabel>
              <StatNumber>{toLocalTime(data.nautical_twilight_begin)}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>نهاية الشفق البحري</StatLabel>
              <StatNumber>{toLocalTime(data.nautical_twilight_end)}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>بداية الشفق الفلكي</StatLabel>
              <StatNumber>{toLocalTime(data.astronomical_twilight_begin)}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>نهاية الشفق الفلكي</StatLabel>
              <StatNumber>{toLocalTime(data.astronomical_twilight_end)}</StatNumber>
            </Stat>
          </SimpleGrid>
        </CardBody>
      </Card>
    </Container>
  );
}
