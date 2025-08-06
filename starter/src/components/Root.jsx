// import React from 'react';
// import { Outlet } from 'react-router-dom';
// import { Navigation } from './Navigation';
// import { Box } from '@chakra-ui/react';

// export const Root = () => {
//   return (
//     <Box>
//       <Navigation />
//       <Outlet />
//     </Box>
//   );
// };

import React from "react";
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import { Box } from "@chakra-ui/react";

export const Root = () => {
  return (
    <Box>
      <Navigation />
      <Box maxW="800px" mx="auto" p={4}>
        <Outlet />
      </Box>
    </Box>
  );
};
