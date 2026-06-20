"use client";
import {
  Stat,
  StatNumber,
  Table,
  TableCaption,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { Database } from "../types/supabase";

export type HolyNames = {
  id: number;
  holy_name: string;
  east: number;
  west: number;
};
export const HolyNames = () => {
  const supabase = createClientComponentClient<Database>();
  const [names, setNames] = useState<any>([]);
  useEffect(() => {
    const getNames = async () => {
      const { data, error } = await supabase.from("holy_names").select();
      if (error) throw error;
      setNames(data);
    };
    getNames();
  }, [supabase]);

  return (
    <TableContainer dir="rtl">
      <Table size={"md"} className="lg:w-1/3">
        <TableCaption placement="top" fontSize={"xxx-large"}>
          إحصاء أسماء الله الحسنى
        </TableCaption>
        <Thead>
          <Tr>
            <Th>الكلمة</Th>
            <Th isNumeric>عدد الحروف</Th>
            <Th isNumeric>الرقم</Th>
          </Tr>
        </Thead>
        <Tbody>
          {names.map((i: HolyNames, j: number) => (
            <Tr key={i.id + j} className="">
              <Td width={"min-content"} className="bg-zinc-500">
                <Tag size="lg" color={"teal"}>
                  {i.holy_name}
                </Tag>
              </Td>
              <Td width={"min-content"} fontSize={"x-large"}>
                {i.holy_name.length}
              </Td>
              <Td isNumeric>
                <Stat>
                  <StatNumber width={"3ch"} fontSize={"larger"}>
                    {i.east}
                  </StatNumber>
                </Stat>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
