"use client";
import { useState } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Textarea,
  Container,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
} from "@chakra-ui/react";

import { CalcJomal } from "~/utils";
import { Card, CardHeader, CardBody } from "@chakra-ui/react";
import { track } from "@vercel/analytics/react";
import { DefaultText } from "~/texts";
import { CalcJomalT } from "~/types";

export default function JummalCard() {
  const [jomalValues, setJomalValues] = useState<CalcJomalT>({
    ge: 0,
    gw: 0,
    se: 0,
    sw: 0,
    n: 0,
  });
  const submitContact = async (event: any) => {
    let inputValue = event.target.value;
    event.preventDefault();
    track("CalcJummal", { input: inputValue });
    setJomalValues(CalcJomal(inputValue));
  };
  return (
    <Container maxW={"4xl"} centerContent>
      <Card className="w-full p-4">
        <CardHeader className="flex gap-3 p-2">
          <Heading textAlign={"center"} w="full">
            {DefaultText.JummalCard.cardTitle}
          </Heading>
        </CardHeader>
        <CardBody>
          <Textarea
            placeholder={DefaultText.JummalCard.textAreaPlaceholder}
            className="w-full p-2 h-20 text-title-md"
            isRequired
            onChange={submitContact}
          />
        </CardBody>
      </Card>

      <TableContainer w={"full"}>
        <Table
          size={"lg"}
          variant={"striped"}
          colorScheme="purple"
          layout={"number"}
        >
          <TableCaption
            placement="top"
            fontSize={"xx-large"}
            color={"orange"}
            bg={"purple"}
          >
            {DefaultText.JummalCard.outputTable.title}
          </TableCaption>
          <Thead>
            <Tr>
              <Th textAlign={"center"} fontSize={"large"}>
                {DefaultText.JummalCard.outputTable.tableHeader.east}
              </Th>
              <Th textAlign={"center"} fontSize={"large"}>
                {DefaultText.JummalCard.outputTable.tableHeader.west}
              </Th>
              <Th textAlign={"center"} fontSize={"large"}>
                {DefaultText.JummalCard.outputTable.tableHeader.nafsy}
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td isNumeric textAlign={"center"} fontSize={"x-large"}>
                <StatGroup>
                  <Stat>
                    <StatLabel>الكبير</StatLabel>

                    <StatNumber>{jomalValues.ge}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>الصغير</StatLabel>

                    <StatNumber>{jomalValues.se}</StatNumber>
                  </Stat>
                </StatGroup>
              </Td>
              <Td isNumeric textAlign={"center"} fontSize={"x-large"}>
                <StatGroup>
                  <Stat>
                    <StatLabel>الكبير</StatLabel>
                    <StatNumber>{jomalValues.gw}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>الصغير</StatLabel>
                    <StatNumber>{jomalValues.sw}</StatNumber>
                  </Stat>
                </StatGroup>
              </Td>
              <Td isNumeric textAlign={"center"} fontSize={"x-large"}>
                {jomalValues.n}
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </Container>
  );
}
