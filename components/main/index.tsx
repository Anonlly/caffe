import {
  Box,
  Flex,
  Icon,
  Input,
  InputLeftElement,
  InputRightElement,
  InputGroup,
  Text,
} from "@chakra-ui/react"
import { SearchIcon, ArrowRightIcon } from "@chakra-ui/icons"
import { BsChevronRight } from "react-icons/bs"
import React, { useEffect, useState, useContext } from "react"
import { ActiveServer } from "../serverList"

const SearchComponent = React.memo(() => {
  function search(e: React.MouseEvent<HTMLElement>){

  }
  return (
    <InputGroup m={"20px 40px"} w={"280px"}>
      <InputLeftElement
        pointerEvents='none'
        children={<SearchIcon color='gray.300' />}
      />
      <Input
        variant={"flushed"}
        colorScheme="mochaPink"
        w={"280px"}
        color={"gray.300"}
        focusBorderColor={"mochaPink.300"}
        _placeholder={{ color: 'gray.300' }}
        borderColor={"mochaPink.200"}
        placeholder="Search Something"
      />
      <InputRightElement
        onClick={search}
        zIndex={3}
        cursor="pointer"
        children={<Icon as={BsChevronRight} color="gray.300" />}
      />
    </InputGroup>
  )
})

export default function Main() {
  const activeServer = useContext(ActiveServer)
  return (
    <Box>
      <SearchComponent/>
    </Box>
  )
}

function General(props) {

}